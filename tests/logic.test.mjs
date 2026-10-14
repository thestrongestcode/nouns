import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS } from '../server/questions.js';
import { optionOrder, shuffledCorrectIndex } from '../server/game-logic.js';
import { rankPlayers, teamSummary, ordinal, joinNames } from '../src/scoring.js';

test('option order is a permutation of 0-3 and stable for a room and card', () => {
  const order = optionOrder('room-1', 7);
  assert.deepEqual([...order].sort(), [0, 1, 2, 3]);
  assert.deepEqual(optionOrder('room-1', 7), order);
});

test('shuffling keeps the right answer text for every real question', () => {
  for (const q of QUESTIONS) {
    const order = optionOrder('room-keep', q.id);
    const shown = order.map(i => q.options[i]);
    assert.equal(shown[shuffledCorrectIndex(order, q.correct)], q.options[q.correct], `question ${q.id}`);
  }
});

test('the correct answer lands in every slot, not mostly B', () => {
  const counts = [0, 0, 0, 0];
  for (let room = 0; room < 100; room++) {
    for (const q of QUESTIONS) counts[shuffledCorrectIndex(optionOrder('room-' + room, q.id), q.correct)]++;
  }
  // 3200 samples, so each slot should be near 800. The unshuffled key was 3/13/10/6 out of 32.
  for (const n of counts) assert.ok(n > 650 && n < 950, `uneven spread: ${counts}`);
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
  const equalAverages = [
    ...[1, 2, 3].map(id => ({ id, name: 'a' + id, team: 'A', score: 15 })),
    ...[4, 5].map(id => ({ id, name: 'b' + id, team: 'B', score: 15 })),
  ];
  const tied = teamSummary(equalAverages);
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
  assert.equal(result.A.total > result.B.total, true);
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
