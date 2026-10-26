import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, CHAMBERS } from '../src/questions.js';

// Words as a reader sees them: letters, marks, and apostrophes (including curly ones).
const tokens = text => text.match(/[\p{L}\p{M}’']+/gu) || [];

test('the bank has 128 cards, 32 per chamber, with unique ids', () => {
  assert.equal(QUESTIONS.length, 128);
  assert.equal(new Set(QUESTIONS.map(q => q.id)).size, 128);
  assert.equal(CHAMBERS.length, 4);
  for (let sector = 0; sector < 4; sector++) {
    assert.equal(QUESTIONS.filter(q => q.sector === sector).length, 32, `chamber ${sector}`);
  }
});

test('every chamber has 16 label cards and 16 word cards', () => {
  for (let sector = 0; sector < 4; sector++) {
    const cards = QUESTIONS.filter(q => q.sector === sector);
    assert.equal(cards.filter(q => q.type === 'label').length, 16, `labels in chamber ${sector}`);
    assert.equal(cards.filter(q => q.type === 'word').length, 16, `words in chamber ${sector}`);
  }
});

test('every card has four distinct options and an answer that is one of them', () => {
  for (const q of QUESTIONS) {
    assert.equal(q.options.length, 4, `card ${q.id} option count`);
    assert.equal(new Set(q.options).size, 4, `card ${q.id} has duplicate options`);
    assert.ok(q.options.includes(q.answer), `card ${q.id} answer is missing from options`);
  }
});

test('label cards highlight a word from the sentence and ask "This highlighted word is..."', () => {
  for (const q of QUESTIONS.filter(card => card.type === 'label')) {
    assert.ok(q.context.includes(q.focus), `card ${q.id}: "${q.focus}" is not in the sentence`);
    assert.equal(q.prompt, 'This highlighted word is...', `card ${q.id} prompt`);
    assert.ok(q.options.every(o => /^(a|an) /.test(o)), `card ${q.id}: labels should start with a or an`);
  }
});

test('word cards ask "Which word in this sentence is..." and every option is a word in the sentence', () => {
  for (const q of QUESTIONS.filter(card => card.type === 'word')) {
    assert.match(q.prompt, /^Which word in this sentence is (a|an) /, `card ${q.id} prompt`);
    const words = tokens(q.context);
    for (const option of q.options) {
      assert.ok(words.includes(option), `card ${q.id}: "${option}" is not a whole word in the sentence`);
    }
    assert.ok(q.options.every(o => !o.includes(' ')), `card ${q.id}: word options should be single words`);
  }
});

test('the label answer matches the card skill, so the debrief names the right concept', () => {
  for (const q of QUESTIONS.filter(card => card.type === 'label')) {
    assert.equal(q.answer, `${/^[aeiou]/i.test(q.skill) ? 'an' : 'a'} ${q.skill}`, `card ${q.id}`);
  }
});

test('the highlighted word is a whole word, so the board never highlights part of a longer word', () => {
  // Only label cards are highlighted; word-card answers are checked as whole words above.
  for (const q of QUESTIONS.filter(card => card.type === 'label')) {
    const at = q.context.indexOf(q.focus);
    const before = q.context[at - 1] || ' ';
    const after = q.context[at + q.focus.length] || ' ';
    assert.ok(!/[\p{L}]/u.test(before) && !/[\p{L}]/u.test(after), `card ${q.id}: "${q.focus}" is inside a longer word`);
  }
});

test('quotations name their source', () => {
  for (const q of QUESTIONS) {
    assert.equal(typeof q.source, 'string', `card ${q.id} source`);
  }
  assert.ok(QUESTIONS.filter(q => q.source).length >= 20, 'expected the literary lines to carry sources');
});

test('no card uses types the class has not covered', () => {
  const uncovered = /gerund|compound|non-count|reciprocal/i;
  for (const q of QUESTIONS) {
    const text = [q.skill, q.prompt, q.hint, q.why, q.discuss, ...q.options].join(' ');
    assert.ok(!uncovered.test(text), `card ${q.id} mentions a type that was not covered`);
  }
});

test('every card has a hint, an explanation, and a discussion question', () => {
  for (const q of QUESTIONS) {
    for (const field of ['hint', 'why', 'discuss']) {
      assert.ok(typeof q[field] === 'string' && q[field].trim().length > 0, `card ${q.id} missing ${field}`);
    }
  }
});

test('every sentence is different, so the game is not repetitive', () => {
  assert.equal(new Set(QUESTIONS.map(q => q.context)).size, QUESTIONS.length, 'a sentence is used twice');
});

test('no card uses an em dash, which is the user preference for written text', () => {
  for (const q of QUESTIONS) {
    const texts = [q.context, q.hint, q.why, q.discuss, q.prompt, q.source, ...q.options];
    assert.ok(texts.every(t => !String(t).includes('\u2014')), `card ${q.id} has an em dash`);
  }
});
