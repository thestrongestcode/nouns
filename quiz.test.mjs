import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, CHAMBERS } from '../server/questions.js';

test('includes all 32 original challenges',()=>{
  assert.equal(QUESTIONS.length,32);
  assert.equal(CHAMBERS.length,4);
  assert.deepEqual(QUESTIONS.map(q=>q.id),Array.from({length:32},(_,i)=>i+1));
});
test('quick game covers each of the 16 required types exactly once',()=>{
  const expected=['Singular noun','Plural noun','Possessive noun','Proper noun',
    'Common noun','Collective noun','Concrete noun','Abstract noun',
    'Personal pronoun','Possessive pronoun','Reflexive pronoun','Intensive pronoun',
    'Interrogative pronoun','Relative pronoun','Demonstrative pronoun','Indefinite pronoun'];
  assert.deepEqual(QUESTIONS.slice(0,16).map(q=>q.skill),expected);
});
test('every card has four distinct options and an answer explanation',()=>{
  for(const q of QUESTIONS){
    assert.ok(q.prompt.length>5);
    assert.equal(q.options.length,4);
    assert.equal(new Set(q.options).size,4);
    assert.ok(Number.isInteger(q.correct) && q.correct>=0 && q.correct<4);
    assert.ok(q.why.length>10 && q.discuss.length>10);
  }
});
