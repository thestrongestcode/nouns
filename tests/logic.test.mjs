import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS } from '../server/questions.js';
import { optionOrder, shuffledCorrectIndex, pickRoomQuestions } from '../server/game-logic.js';
import { rankPlayers, teamSummary, ordinal, joinNames } from '../src/scoring.js';

test('option order is a permutation of 0-3 and stable for a room and card', () => {
  const order = optionOrder('room-1', 7);
  assert.deepEqual([...order].sort(), [0, 1, 2, 3]);
  assert.deepEqual(optionOrder('room-1', 7), order);
});

test('shuffling keeps the right answer text for every card', () => {
  for (const q of QUESTIONS) {
    const order = optionOrder('room-keep', q.id);
    const shown = order.map(i => q.options[i]);
    assert.equal(shown[shuffledCorrectIndex(order, q.correct)], q.options[q.correct], `card ${q.id}`);
  }
});

test('the correct answer lands in every slot, not mostly B', () => {
  const counts = [0, 0, 0, 0];
  for (let room = 0; room < 100; room++) {
    for (const q of QUESTIONS) counts[shuffledCorrectIndex(optionOrder('room-' + room, q.id), q.correct)]++;
  }
  const total = 100 * QUESTIONS.length;
  for (const n of counts) assert.ok(Math.abs(n / total - 0.25) < 0.03, `uneven spread: ${counts}`);
});

test('a room gets 4 cards per chamber for a quick game and 8 for a full game', () => {
  for (const [count, perChamber] of [[16, 4], [32, 8]]) {
    const cards = pickRoomQuestions(QUESTIONS, 'room-size', count);
    assert.equal(cards.length, count);
    for (let sector = 0; sector < 4; sector++) {
      assert.equal(cards.filter(c => c.sector === sector).length, perChamber);
    }
    assert.equal(new Set(cards.map(c => c.id)).size, count, 'no card repeats within a game');
  }
});

test('cards are grouped by chamber in order, so the chamber track makes sense', () => {
  const sectors = pickRoomQuestions(QUESTIONS, 'room-order', 32).map(c => c.sector);
  assert.deepEqual(sectors, [...sectors].sort((a, b) => a - b));
});

test('different rooms get different mixes, and the same room always gets the same mix', () => {
  const ids = room => pickRoomQuestions(QUESTIONS, room, 16).map(c => c.id).join(',');
  assert.equal(ids('alpha'), ids('alpha'));
  const mixes = new Set(['a', 'b', 'c', 'd', 'e', 'f'].map(r => ids('room-' + r)));
  assert.ok(mixes.size > 1, 'every room got the same cards');
});

test('tied players share a rank', () => {
  const ranked = rankPlayers([
    { id: 1, name: 'Dev', score: 0 }, { id: 2, name: 'Ana', score: 15 }, { id: 3, name: 'Ben', score: 15 },
    { id: 4, name: 'Cleo', score: 15 }, { id: 5, name: 'Eli', score: 15 },
  ]);
  assert.deepEqual(ranked.map(p => p.rank), [1, 1, 1, 1, 5]);
  assert.ok(ranked.slice(0, 4).every(p => p.tied));
  assert.equal(ranked[4].tied, false);
});

test('a bigger team does not win just by having more players', () => {
  const equal = [
    ...[1, 2, 3].map(id => ({ id, name: 'a' + id, team: 'A', score: 15 })),
    ...[4, 5].map(id => ({ id, name: 'b' + id, team: 'B', score: 15 })),
  ];
  const tied = teamSummary(equal);
  assert.equal(tied.A.total, 45);
  assert.equal(tied.B.total, 30);
  assert.equal(tied.leader, null);
  assert.equal(tied.tied, true);
});

test('the team with the higher average per player leads', () => {
  const players = [
    ...[1, 2, 3].map(id => ({ id, name: 'a' + id, team: 'A', score: 10 })),
    ...[4, 5].map(id => ({ id, name: 'b' + id, team: 'B', score: 12 })),
  ];
  const result = teamSummary(players);
  assert.equal(result.leader, 'B');
  assert.equal(result.B.average, 12);
});

test('no team result until both teams have players', () => {
  const result = teamSummary([{ id: 1, name: 'Solo', team: 'A', score: 30 }]);
  assert.equal(result.leader, null);
  assert.equal(result.tied, false);
});

test('ordinals and name lists read naturally', () => {
  assert.deepEqual([1, 2, 3, 4, 11, 12, 13, 21, 22, 101, 111].map(ordinal),
    ['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '101st', '111th']);
  assert.equal(joinNames(['Ana']), 'Ana');
  assert.equal(joinNames(['Ana', 'Ben']), 'Ana and Ben');
  assert.equal(joinNames(['Ana', 'Ben', 'Cleo']), 'Ana, Ben and Cleo');
  assert.equal(joinNames(['Ana', 'Ben', 'Cleo', 'Dev', 'Eli']), 'Ana, Ben, Cleo and 2 more');
});
