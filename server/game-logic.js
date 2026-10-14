import { createHash } from 'node:crypto';

// Answer options are shuffled per room and per question. Every device in a room sees
// the same order, but the right answer no longer sits in the same slot game after game.
// (In the original key the correct answer was "B" for 13 of 32 cards and "A" for only 3,
// so always tapping B was a winning strategy.)
//
// Returns a permutation of [0..length-1]: displayed slot i shows original option order[i].
export function optionOrder(roomId, questionId, length = 4) {
  const order = Array.from({ length }, (_, i) => i);
  const bytes = createHash('sha256').update(`${roomId}:${questionId}`).digest();
  for (let i = length - 1; i > 0; i--) {
    const j = bytes[i] % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// Where the correct answer appears after shuffling.
export function shuffledCorrectIndex(order, correct) {
  return order.indexOf(correct);
}
