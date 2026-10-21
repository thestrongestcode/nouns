import test from 'node:test';
import assert from 'node:assert/strict';
import { FLASHCARDS } from '../src/flashcards.js';
import { QUESTIONS } from '../src/questions.js';

test('there is a flashcard for every type of noun and pronoun the game asks about', () => {
  const skills = new Set(QUESTIONS.map(q => q.skill));
  const cards = new Set(FLASHCARDS.map(c => c.skill));
  for (const skill of skills) assert.ok(cards.has(skill), `no flashcard for "${skill}"`);
});

test('each type has exactly one flashcard, split into nouns and pronouns', () => {
  assert.equal(new Set(FLASHCARDS.map(c => c.skill)).size, FLASHCARDS.length);
  for (const card of FLASHCARDS) {
    const expected = card.skill.endsWith('pronoun') ? 'Pronouns' : 'Nouns';
    assert.equal(card.group, expected, card.skill);
  }
});

test('each flashcard has a definition, examples, a tip, and a sentence that contains its highlighted word', () => {
  for (const card of FLASHCARDS) {
    assert.ok(card.definition.trim(), `${card.skill} definition`);
    assert.ok(card.tip.trim(), `${card.skill} tip`);
    assert.ok(card.examples.length >= 2, `${card.skill} examples`);
    assert.ok(card.sentence.includes(card.focus), `${card.skill}: "${card.focus}" not in sentence`);
  }
});

test('each flashcard highlights a whole word in its sentence', () => {
  for (const card of FLASHCARDS) {
    const at = card.sentence.indexOf(card.focus);
    const before = card.sentence[at - 1] || ' ';
    const after = card.sentence[at + card.focus.length] || ' ';
    assert.ok(!/\p{L}/u.test(before) && !/\p{L}/u.test(after), `${card.skill}: "${card.focus}" is inside a longer word`);
  }
});

test('no flashcard text uses an em dash', () => {
  for (const card of FLASHCARDS) {
    const text = [card.definition, card.tip, card.sentence, ...card.examples].join(' ');
    assert.ok(!text.includes('—'), `${card.skill} has an em dash`);
  }
});
