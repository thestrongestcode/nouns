import test from 'node:test';
import assert from 'node:assert/strict';
import { handleRequest } from '../server/engine.js';
import { createMemoryDatabase } from '../server/memory-db.js';
import { QUESTIONS } from '../server/questions.js';
import { optionOrder, shuffledCorrectIndex, pickRoomQuestions } from '../server/game-logic.js';

// These tests run the real game engine against the in-memory database.

async function newGame({ mode = 'individual', length = 16, seconds = 30, names = ['Ana', 'Ben', 'Cleo'] } = {}) {
  const db = createMemoryDatabase();
  const call = body => handleRequest(body, { getDb: () => db });
  const host = (await call({ action: 'create', name: 'Teacher', length, seconds, mode })).json;
  const players = [];
  for (const name of names) {
    const joined = (await call({ action: 'join', code: host.code, name })).json;
    players.push({ name, token: joined.token });
  }
  const code = host.code;
  const cards = () => pickRoomQuestions(QUESTIONS, db.tables.vault_rooms[0].id, length);
  return {
    db, call, code, host, players, cards,
    state: who => call({ action: 'state', code, token: who.token }).then(r => r.json),
    control: command => call({ action: 'control', code, token: host.token, command }),
    answer: (who, choice) => call({ action: 'answer', code, token: who.token, choice }),
  };
}

// The slot (0-3) where the right answer is displayed for the live card.
function correctSlot(snapshot) {
  const card = QUESTIONS.find(q => q.id === snapshot.question.id);
  return shuffledCorrectIndex(optionOrder(snapshot.roomId, card.id), card.correct);
}

test('players cannot see the answer or explanation before the reveal', async () => {
  const game = await newGame();
  await game.control('start');
  const snapshot = await game.state(game.players[0]);
  assert.equal(snapshot.status, 'playing');
  for (const key of ['correct', 'why', 'discuss', 'skill', 'counts']) {
    assert.equal(key in snapshot.question, false, `${key} leaked`);
  }
  assert.equal(snapshot.question.options.length, 4);
  assert.ok(snapshot.question.hint, 'hint should be available to students');
});

test('a full quick game scores against the shuffled slots and ends with personal results', async () => {
  const game = await newGame();
  const [ana, ben] = game.players;
  await game.control('start');
  const plannedCards = game.cards();
  let movedAnswers = 0;

  for (let card = 0; card < 16; card++) {
    const snapshot = await game.state(ana);
    assert.equal(snapshot.index, card);
    assert.equal(snapshot.question.id, plannedCards[card].id, 'the room played cards in the planned order');
    const slot = correctSlot(snapshot);
    if (slot !== plannedCards[card].correct) movedAnswers++;

    assert.equal((await game.answer(ana, slot)).status, 200);
    assert.equal((await game.answer(ben, (slot + 1) % 4)).status, 200);
    await game.control('reveal');

    const hostView = await game.state(game.host);
    assert.equal(hostView.question.correct, slot);
    assert.equal((await game.state(ana)).question.myPoints, 15);
    assert.equal((await game.state(ben)).question.myPoints, 0);
    assert.equal(hostView.question.counts[slot], 1);
    await game.control('next');
  }
  assert.ok(movedAnswers > 0, 'the shuffle never moved an answer, so this test proves nothing');

  const anaEnd = await game.state(ana);
  assert.equal(anaEnd.status, 'finished');
  assert.equal(anaEnd.playedCount, 16);
  assert.deepEqual(anaEnd.myResult, { answered: 16, correct: 16 });
  assert.deepEqual((await game.state(ben)).myResult, { answered: 16, correct: 0 });
  assert.equal((await game.state(game.host)).myResult, null);
  assert.equal(anaEnd.players.find(p => p.name === 'Ana').score, 240);
  assert.ok(anaEnd.report.every(r => r.correct < r.total), 'report lists only missed concepts');
});

test('ending early reports only the cards that were played', async () => {
  const game = await newGame();
  const [ana] = game.players;
  await game.control('start');
  await game.answer(ana, correctSlot(await game.state(ana)));
  await game.control('reveal');
  await game.control('finish');
  const snapshot = await game.state(ana);
  assert.equal(snapshot.status, 'finished');
  assert.equal(snapshot.playedCount, 1);
  assert.deepEqual(snapshot.myResult, { answered: 1, correct: 1 });
});

test('slow answers earn 10, late answers are refused, and each card allows one answer', async () => {
  const game = await newGame({ seconds: 30 });
  const [ana, ben, cleo] = game.players;
  await game.control('start');
  const slot = correctSlot(await game.state(ana));

  assert.equal((await game.answer(ana, slot)).status, 200);
  const again = await game.answer(ana, slot);
  assert.equal(again.status, 400);
  assert.match(again.json.error, /already answered/i);

  game.db.advance(11);
  assert.equal((await game.answer(cleo, slot)).status, 200);

  game.db.advance(25);
  const late = await game.answer(ben, slot);
  assert.equal(late.status, 400);
  assert.match(late.json.error, /time is up/i);

  await game.control('reveal');
  assert.equal((await game.state(ana)).question.myPoints, 15);
  assert.equal((await game.state(cleo)).question.myPoints, 10);
  assert.equal((await game.state(ben)).question.myPoints, 0);
});

test('team mode balances players to within one', async () => {
  const game = await newGame({ mode: 'teams', names: ['Ana', 'Ben', 'Cleo', 'Dev', 'Eli'] });
  const { players } = await game.state(game.host);
  const count = team => players.filter(p => p.team === team).length;
  assert.deepEqual([count('A'), count('B')], [3, 2]);
});

test('names must be unique and nobody can join after the start', async () => {
  const game = await newGame({ names: ['Ana'] });
  const duplicate = await game.call({ action: 'join', code: game.code, name: 'ana' });
  assert.equal(duplicate.status, 400);
  assert.match(duplicate.json.error, /taken/i);
  await game.control('start');
  const late = await game.call({ action: 'join', code: game.code, name: 'Newcomer' });
  assert.equal(late.status, 400);
  assert.match(late.json.error, /already started/i);
});

test('only the host can control the round, and bad tokens are rejected', async () => {
  const game = await newGame();
  const asPlayer = await game.call({ action: 'control', code: game.code, token: game.players[0].token, command: 'start' });
  assert.equal(asPlayer.status, 400);
  const badToken = await game.call({ action: 'state', code: game.code, token: 'f'.repeat(64) });
  assert.equal(badToken.status, 403);
});

test('state includes the server clock so devices can correct their own', async () => {
  const game = await newGame();
  const snapshot = await game.state(game.host);
  assert.ok(Math.abs(snapshot.serverTime - Date.now()) < 5000);
});

test('config works without a database, so the page can start up anywhere', async () => {
  const result = await handleRequest({ action: 'config' }, { getDb: () => { throw new Error('should not be called'); } });
  assert.equal(result.status, 200);
  assert.deepEqual(result.json, { url: null, publishableKey: null });
});

test('an unconfigured server explains itself without leaking internals', async () => {
  const result = await handleRequest({ action: 'create', name: 'Teacher', length: 16, seconds: 30, mode: 'individual' }, {
    getDb: () => { throw new Error('Server not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY in Vercel.'); },
  });
  assert.equal(result.status, 503);
  assert.match(result.json.error, /Server not configured/);
});
