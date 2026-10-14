import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/game.js';
import { useDatabase } from '../server/db.js';
import { createFakeDatabase } from '../dev/fake-db.js';
import { QUESTIONS } from '../server/questions.js';
import { optionOrder, shuffledCorrectIndex } from '../server/game-logic.js';

// These tests run the real API handler against the in-memory database in dev/fake-db.js.

async function call(body) {
  let http = 200;
  let data;
  const res = { setHeader() {}, status(code) { http = code; return res; }, json(value) { data = value; return res; } };
  await handler({ method: 'POST', headers: {}, body }, res);
  return { http, data };
}

async function newGame({ mode = 'individual', length = 16, seconds = 30, names = ['Ana', 'Ben', 'Cleo'] } = {}) {
  const db = createFakeDatabase();
  useDatabase(db);
  const host = (await call({ action: 'create', name: 'Teacher', length, seconds, mode })).data;
  const players = [];
  for (const name of names) {
    const joined = (await call({ action: 'join', code: host.code, name })).data;
    players.push({ name, token: joined.token });
  }
  const code = host.code;
  return {
    db, code, host, players,
    state: who => call({ action: 'state', code, token: who.token }).then(r => r.data),
    control: command => call({ action: 'control', code, token: host.token, command }),
    answer: (who, choice) => call({ action: 'answer', code, token: who.token, choice }),
  };
}

// The slot (0-3) where the right answer is displayed for the live card.
function correctSlot(snapshot) {
  const original = QUESTIONS.find(q => q.id === snapshot.question.id);
  return shuffledCorrectIndex(optionOrder(snapshot.roomId, original.id), original.correct);
}

test('players cannot see the answer before the reveal', async () => {
  const game = await newGame();
  await game.control('start');
  const snapshot = await game.state(game.players[0]);
  assert.equal(snapshot.status, 'playing');
  for (const key of ['correct', 'why', 'discuss', 'skill', 'counts']) {
    assert.equal(key in snapshot.question, false, `${key} leaked`);
  }
  assert.equal(snapshot.question.options.length, 4);
});

test('a full quick game scores against the shuffled slots and ends with personal results', async () => {
  const game = await newGame();
  const [ana, ben] = game.players;
  await game.control('start');
  let cardsWhereAnswerMoved = 0;

  for (let card = 0; card < 16; card++) {
    const snapshot = await game.state(ana);
    assert.equal(snapshot.index, card);
    const slot = correctSlot(snapshot);
    if (slot !== QUESTIONS[card].correct) cardsWhereAnswerMoved++;

    assert.equal((await game.answer(ana, slot)).http, 200);
    assert.equal((await game.answer(ben, (slot + 1) % 4)).http, 200);
    await game.control('reveal');

    const hostView = await game.state(game.host);
    assert.equal(hostView.question.correct, slot);
    const anaView = await game.state(ana);
    const benView = await game.state(ben);
    assert.equal(anaView.question.myPoints, 15);
    assert.equal(benView.question.myPoints, 0);
    assert.equal(hostView.question.counts[slot], 1);
    await game.control('next');
  }
  assert.ok(cardsWhereAnswerMoved > 0, 'the shuffle never moved an answer, so this test proves nothing');

  const anaEnd = await game.state(ana);
  assert.equal(anaEnd.status, 'finished');
  assert.equal(anaEnd.playedCount, 16);
  assert.deepEqual(anaEnd.myResult, { answered: 16, correct: 16 });
  assert.deepEqual((await game.state(ben)).myResult, { answered: 16, correct: 0 });
  assert.equal((await game.state(game.host)).myResult, null);
  assert.equal(anaEnd.players.find(p => p.name === 'Ana').score, 240);
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

  assert.equal((await game.answer(ana, slot)).http, 200);
  const again = await game.answer(ana, slot);
  assert.equal(again.http, 400);
  assert.match(again.data.error, /already answered/i);

  game.db.advance(11);
  assert.equal((await game.answer(cleo, slot)).http, 200);

  game.db.advance(25);
  const late = await game.answer(ben, slot);
  assert.equal(late.http, 400);
  assert.match(late.data.error, /time is up/i);

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
  const duplicate = await call({ action: 'join', code: game.code, name: 'ana' });
  assert.equal(duplicate.http, 400);
  assert.match(duplicate.data.error, /taken/i);
  await game.control('start');
  const late = await call({ action: 'join', code: game.code, name: 'Newcomer' });
  assert.equal(late.http, 400);
  assert.match(late.data.error, /already started/i);
});

test('only the host can control the round, and bad tokens are rejected', async () => {
  const game = await newGame();
  const asPlayer = await call({ action: 'control', code: game.code, token: game.players[0].token, command: 'start' });
  assert.equal(asPlayer.http, 400);
  const badToken = await call({ action: 'state', code: game.code, token: 'f'.repeat(64) });
  assert.equal(badToken.http, 403);
});

test('state includes the server clock so devices can correct their own', async () => {
  const game = await newGame();
  const snapshot = await game.state(game.host);
  assert.ok(Math.abs(snapshot.serverTime - Date.now()) < 5000);
});
