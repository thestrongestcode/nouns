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

// ---- Board mode: one device, the teacher enters every answer ----

async function newBoardGame({ names = 'Ana\nBen\nCleo', length = 16, mode = 'individual' } = {}) {
  const db = createMemoryDatabase();
  const call = body => handleRequest(body, { getDb: () => db });
  const host = (await call({ action: 'create', name: 'Teacher', length, seconds: 30, mode, input: 'board', roster: names })).json;
  const { players } = (await call({ action: 'state', code: host.code, token: host.token })).json;
  const control = command => call({ action: 'control', code: host.code, token: host.token, command });
  const enter = (playerId, choice) => call({ action: 'enterAnswer', code: host.code, token: host.token, playerId, choice });
  const state = () => call({ action: 'state', code: host.code, token: host.token }).then(r => r.json);
  return { db, call, host, players, control, enter, state };
}

test('board mode: the roster is created from the names entered, with no student joins', async () => {
  const game = await newBoardGame({ names: 'Ana\nBen\nCleo\nDev' });
  assert.deepEqual(game.players.map(p => p.name).sort(), ['Ana', 'Ben', 'Cleo', 'Dev']);
  assert.equal(game.players.length, 4);
  const join = await game.call({ action: 'join', code: game.host.code, name: 'Eli' });
  assert.equal(join.status, 400);
  assert.match(join.json.error, /shared on one device/i);
});

test('board mode: duplicate names and empty rosters are refused', async () => {
  const db = createMemoryDatabase();
  const call = body => handleRequest(body, { getDb: () => db });
  const dup = await call({ action: 'create', name: 'T', length: 16, seconds: 30, mode: 'individual', input: 'board', roster: 'Ana\nana' });
  assert.equal(dup.status, 400);
  assert.match(dup.json.error, /listed twice/i);
  const empty = await call({ action: 'create', name: 'T', length: 16, seconds: 30, mode: 'individual', input: 'board', roster: '  \n ' });
  assert.equal(empty.status, 400);
});

test('board mode: the teacher enters answers, points have no speed bonus, and the reveal scores', async () => {
  const game = await newBoardGame();
  const [ana, ben, cleo] = game.players;
  await game.control('start');
  const snapshot = await game.state();
  assert.equal(snapshot.input, 'board');
  assert.equal(snapshot.entries.length, 0);
  const slot = correctSlot(snapshot);

  assert.equal((await game.enter(ana.id, slot)).status, 200);
  assert.equal((await game.enter(ben.id, (slot + 1) % 4)).status, 200);
  game.db.advance(120); // no timer on a board, so a long pause must not block entries
  assert.equal((await game.enter(cleo.id, slot)).status, 200);

  const before = await game.state();
  assert.equal(before.entries.length, 3);
  assert.equal(before.answersReceived, 3);
  assert.equal(before.entries.find(e => e.playerId === ben.id).correct, undefined, 'correctness is hidden until the reveal');

  await game.control('reveal');
  const revealed = await game.state();
  assert.equal(revealed.entries.find(e => e.playerId === ana.id).correct, true);
  assert.equal(revealed.entries.find(e => e.playerId === ben.id).correct, false);
  const total = revealed.players.reduce((n, p) => n + p.score, 0);
  assert.equal(total, 20, 'two correct answers at 10 points each, with no speed bonus');
});

test('board mode: the teacher can change or clear an answer before the reveal', async () => {
  const game = await newBoardGame();
  const [ana] = game.players;
  await game.control('start');
  const slot = correctSlot(await game.state());
  await game.enter(ana.id, (slot + 1) % 4);
  await game.enter(ana.id, slot);
  let snapshot = await game.state();
  assert.equal(snapshot.entries.length, 1, 'changing an answer replaces it, it does not add a second one');
  assert.equal(snapshot.entries[0].choice, slot);
  await game.enter(ana.id, null);
  snapshot = await game.state();
  assert.equal(snapshot.entries.length, 0, 'clearing removes the entry');
});

test('board mode: students cannot answer, and entries are teacher-only', async () => {
  const game = await newBoardGame();
  await game.control('start');
  const asStudent = await game.call({ action: 'enterAnswer', code: game.host.code, token: 'f'.repeat(64), playerId: game.players[0].id, choice: 0 });
  assert.equal(asStudent.status, 403);
  const ownerOnly = await game.call({ action: 'answer', code: game.host.code, token: game.host.token, choice: 0 });
  assert.equal(ownerOnly.status, 400);
});

test('board mode: a whole game runs and the report lists missed concepts', async () => {
  const game = await newBoardGame({ names: 'Ana\nBen' });
  const [ana, ben] = game.players;
  await game.control('start');
  for (let card = 0; card < 16; card++) {
    const snapshot = await game.state();
    const slot = correctSlot(snapshot);
    await game.enter(ana.id, slot);
    await game.enter(ben.id, (slot + 1) % 4);
    await game.control('reveal');
    await game.control('next');
  }
  const finished = await game.state();
  assert.equal(finished.status, 'finished');
  assert.equal(finished.players.find(p => p.name === 'Ana').score, 160);
  assert.equal(finished.players.find(p => p.name === 'Ben').score, 0);
  assert.ok(finished.report.length > 0, 'Ben missed everything, so there should be concepts to review');
  assert.equal(finished.myResult, null, 'the teacher has no personal result');
});
