// Game rules for the one-device board game. No server, no network, no timers.
// Everything here is pure so it can be tested with plain Node.

import { QUESTIONS, CHAMBERS } from './questions.js';

export const POINTS_PER_CORRECT = 10;
export const QUESTION_COUNTS = [16, 32];

// FNV-1a: turns any text into a stable 32-bit number.
export function hashString(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// mulberry32: a small seeded random number generator.
export function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(items, random) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Shows the answers in a new order for each card, so the right answer is not always first.
// Returns the card's options in display order.
export function presentOptions(card, seed) {
  const order = shuffle([...card.options.keys()], seededRandom(hashString(`${seed}:${card.id}`)));
  const options = order.map(i => card.options[i]);
  return { options, correct: options.indexOf(card.answer) };
}

// Picks the cards for one game. Each chamber gives the same number of cards, half of each kind.
// Within a chamber the kinds follow the pattern WORD, LABEL, LABEL, WORD. Because every block of
// four cards is split two and two, and cards alternate between the two teams, each team gets
// one card of each kind in every block.
export function buildGame({ count, seed, teamNames, members }) {
  if (!QUESTION_COUNTS.includes(count)) throw new Error('Choose 16 or 32 questions');
  const perKind = count / 8;
  const random = seededRandom(hashString(`${seed}:deal`));
  const sequence = [];

  CHAMBERS.forEach((_, sector) => {
    const labels = shuffle(QUESTIONS.filter(q => q.sector === sector && q.type === 'label'), random).slice(0, perKind);
    const words = shuffle(QUESTIONS.filter(q => q.sector === sector && q.type === 'word'), random).slice(0, perKind);
    if (labels.length < perKind || words.length < perKind) throw new Error(`Chamber ${sector} is short of cards`);
    const pattern = ['word', 'label', 'label', 'word'];
    for (let p = 0; p < perKind * 2; p++) {
      const kind = pattern[p % 4];
      sequence.push(kind === 'word' ? words.shift() : labels.shift());
    }
  });

  const cards = sequence.map((card, index) => {
    const { options, correct } = presentOptions(card, seed);
    return { ...card, options, correct, team: index % 2, index };
  });

  const teams = teamNames.map((name, i) => ({ name, members: members[i] || [], score: 0 }));
  return { seed, count, cards, teams, index: 0, phase: 'board', picked: null, results: [] };
}

// Records the teacher's choice for the current card. optionIndex is null for "no answer".
export function answer(game, optionIndex) {
  if (game.phase !== 'board') throw new Error('This card is already answered');
  const card = game.cards[game.index];
  const correct = optionIndex !== null && optionIndex === card.correct;
  game.picked = optionIndex;
  game.results[game.index] = correct;
  if (correct) game.teams[card.team].score += POINTS_PER_CORRECT;
  game.phase = 'reveal';
  return correct;
}

export function nextCard(game) {
  if (game.phase !== 'reveal') throw new Error('Reveal the answer first');
  game.index += 1;
  game.picked = null;
  game.phase = game.index >= game.cards.length ? 'finish' : 'board';
  return game;
}

// The winner, or null for a tie. Scores are the same as points, so no averages are needed.
export function winner(game) {
  const [a, b] = game.teams;
  if (a.score === b.score) return null;
  return a.score > b.score ? a : b;
}

// The concept most cards were missed on, for the teacher's debrief.
export function debrief(game) {
  const misses = new Map();
  game.cards.forEach((card, i) => {
    if (i < game.results.length && game.results[i] !== true) {
      misses.set(card.skill, (misses.get(card.skill) || 0) + 1);
    }
  });
  const ranked = [...misses.entries()].sort((a, b) => b[1] - a[1]);
  if (!ranked.length) return null;
  const [skill, count] = ranked[0];
  const total = game.cards.filter(c => c.skill === skill).length;
  return { skill, missed: count, total };
}

// The progress text the board shows, such as "Card 3 of 16".
export function countText(game) {
  return `Card ${Math.min(game.index + 1, game.cards.length)} of ${game.cards.length}`;
}
