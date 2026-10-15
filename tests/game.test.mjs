import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS } from '../src/questions.js';
import {
  buildGame, presentOptions, answer, nextCard, winner, debrief, POINTS_PER_CORRECT, hashString, seededRandom,
} from '../src/game.js';

const setup = (count = 16, seed = 'fixed-seed') => buildGame({
  count, seed, teamNames: ['Ana team', 'Ben team'], members: [['Ana', 'Cleo'], ['Ben', 'Dev']],
});

test('the random helpers give the same result for the same seed', () => {
  assert.equal(hashString('abc'), hashString('abc'));
  const a = seededRandom(hashString('x'));
  const b = seededRandom(hashString('x'));
  assert.deepEqual([a(), a(), a()], [b(), b(), b()]);
});

test('a game has the requested number of cards, 16 or 32, and rejects other sizes', () => {
  assert.equal(setup(16).cards.length, 16);
  assert.equal(setup(32).cards.length, 32);
  assert.throws(() => setup(20), /16 or 32/);
});

test('each chamber gives the same number of cards, half word and half label', () => {
  for (const count of [16, 32]) {
    const game = setup(count);
    for (let sector = 0; sector < 4; sector++) {
      const cards = game.cards.filter(c => c.sector === sector);
      assert.equal(cards.length, count / 4, `chamber ${sector} of ${count}`);
      assert.equal(cards.filter(c => c.type === 'word').length, count / 8);
      assert.equal(cards.filter(c => c.type === 'label').length, count / 8);
    }
  }
});

test('no card repeats within a game', () => {
  const game = setup(32);
  assert.equal(new Set(game.cards.map(c => c.id)).size, 32);
});

test('the teams alternate card by card, with equal numbers of cards each', () => {
  const game = setup(32);
  game.cards.forEach((card, i) => assert.equal(card.team, i % 2, `card ${i}`));
  assert.equal(game.cards.filter(c => c.team === 0).length, 16);
});

test('each block of four cards gives each team one word card and one label card', () => {
  const game = setup(32);
  for (let block = 0; block < 32; block += 4) {
    const slice = game.cards.slice(block, block + 4);
    for (const team of [0, 1]) {
      const mine = slice.filter(c => c.team === team).map(c => c.type).sort();
      assert.deepEqual(mine, ['label', 'word'], `block at card ${block}, team ${team}`);
    }
  }
});

test('the kinds of card alternate in a WORD, LABEL, LABEL, WORD pattern', () => {
  const game = setup(16);
  const pattern = game.cards.map(c => c.type === 'word' ? 'W' : 'L').join('');
  assert.equal(pattern.slice(0, 4), 'WLLW');
  assert.equal(pattern.slice(4, 8), 'WLLW');
});

test('the same seed gives the same game, and a new seed gives a different one', () => {
  assert.deepEqual(setup(16, 's1').cards.map(c => c.id), setup(16, 's1').cards.map(c => c.id));
  assert.notDeepEqual(setup(16, 's1').cards.map(c => c.id), setup(16, 's2').cards.map(c => c.id));
});

test('answer order is a shuffle, and the correct index points at the right answer', () => {
  for (const card of QUESTIONS) {
    const { options, correct } = presentOptions(card, 'order-test');
    assert.deepEqual([...options].sort(), [...card.options].sort(), `card ${card.id}`);
    assert.equal(options[correct], card.answer, `card ${card.id}`);
  }
});

test('a correct answer scores for the team that is up, and only that team', () => {
  const game = setup(16);
  const card = game.cards[0];
  assert.equal(answer(game, card.correct), true);
  assert.equal(game.teams[card.team].score, POINTS_PER_CORRECT);
  assert.equal(game.teams[1 - card.team].score, 0);
});

test('a wrong answer and "no answer" both score 0', () => {
  const game = setup(16);
  const wrong = (game.cards[0].correct + 1) % 4;
  assert.equal(answer(game, wrong), false);
  assert.equal(game.teams[0].score + game.teams[1].score, 0);
  nextCard(game);
  assert.equal(answer(game, null), false);
  assert.equal(game.teams[0].score + game.teams[1].score, 0);
});

test('a card can only be answered once, and the next card needs a reveal first', () => {
  const game = setup(16);
  answer(game, 0);
  assert.throws(() => answer(game, 0), /already answered/);
  nextCard(game);
  assert.throws(() => nextCard(game), /Reveal/);
});

test('the game finishes after the last card and shows a winner', () => {
  const game = setup(16);
  for (let i = 0; i < 16; i++) {
    answer(game, game.cards[i].team === 0 ? game.cards[i].correct : null);
    nextCard(game);
  }
  assert.equal(game.phase, 'finish');
  assert.equal(game.teams[0].score, 8 * POINTS_PER_CORRECT);
  assert.equal(winner(game).name, 'Ana team');
});

test('equal scores are a tie', () => {
  const game = setup(16);
  assert.equal(winner(game), null);
});

test('the debrief names the concept that was missed most often', () => {
  const game = setup(16);
  for (let i = 0; i < 16; i++) {
    answer(game, null);
    nextCard(game);
  }
  const top = debrief(game);
  assert.ok(top);
  // Every card was missed, so the top concept is the one that appears most often in the game.
  const counts = new Map();
  game.cards.forEach(c => counts.set(c.skill, (counts.get(c.skill) || 0) + 1));
  const most = Math.max(...counts.values());
  assert.equal(top.missed, most);
  assert.equal(top.total, counts.get(top.skill));
});
