import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, CHAMBERS } from '../server/questions.js';

test('the bank has 64 cards: the original 32 plus 32 new ones', () => {
  assert.equal(QUESTIONS.length, 64);
  assert.equal(CHAMBERS.length, 4);
  assert.deepEqual(QUESTIONS.map(q => q.id), Array.from({ length: 64 }, (_, i) => i + 1));
});

test('every chamber has 16 cards', () => {
  for (let sector = 0; sector < 4; sector++) {
    assert.equal(QUESTIONS.filter(q => q.sector === sector).length, 16, `chamber ${sector}`);
  }
});

test('every card has four distinct options, a valid answer, and teaching text', () => {
  for (const q of QUESTIONS) {
    assert.ok(q.prompt.length > 5, `card ${q.id} prompt`);
    assert.equal(q.options.length, 4, `card ${q.id} options`);
    assert.equal(new Set(q.options).size, 4, `card ${q.id} duplicate option`);
    assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4, `card ${q.id} correct index`);
    assert.ok(q.why.length > 10 && q.discuss.length > 10, `card ${q.id} explanation`);
    assert.ok(q.hint && q.hint.length > 5, `card ${q.id} hint`);
    assert.ok(q.skill, `card ${q.id} skill`);
  }
});

test('highlighted words actually appear in their sentence', () => {
  for (const q of QUESTIONS.filter(card => card.focus)) {
    assert.ok(q.context?.includes(q.focus), `card ${q.id}: "${q.focus}" not in its sentence`);
  }
});

test('the cards are varied, not one template repeated', () => {
  const prompts = new Set(QUESTIONS.map(q => q.prompt));
  assert.ok(prompts.size >= 50, `only ${prompts.size} distinct prompts`);
  const templated = QUESTIONS.filter(q => q.prompt === 'What kind of pronoun is highlighted?').length;
  assert.ok(templated <= 6, `${templated} cards share one prompt`);
});

test('no card is a copy of another card', () => {
  const seen = new Set();
  for (const q of QUESTIONS) {
    const key = `${q.prompt}|${q.context ?? ''}|${[...q.options].sort().join('|')}`;
    assert.ok(!seen.has(key), `card ${q.id} duplicates an earlier card`);
    seen.add(key);
  }
});
