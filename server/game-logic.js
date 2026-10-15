// Pure game rules with no Node or browser dependencies, so the Vercel API,
// the local mock, the static Pages demo, and the tests all share one implementation.

// FNV-1a: turns any text into a stable 32-bit number.
export function hashString(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// mulberry32: a small seeded random number generator. The same seed always gives the same sequence.
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

// Answer options are shuffled per room and per card. Every device in a room sees the same
// order. Returns a permutation of [0..length-1]: displayed slot i shows original option order[i].
export function optionOrder(roomId, questionId, length = 4) {
  return shuffle([...Array(length).keys()], seededRandom(hashString(`${roomId}:${questionId}`)));
}

// Where the correct answer appears after shuffling.
export function shuffledCorrectIndex(order, correct) {
  return order.indexOf(correct);
}

// Choose the cards for one room. Each chamber (sector) contributes the same number of cards,
// so a 16-card game has four cards from every chamber and the chamber track always makes sense.
// The pick is seeded by the room id, so the same room always gets the same cards.
export function pickRoomQuestions(pool, roomId, count, chambers = 4) {
  if (!Number.isInteger(count) || count % chambers !== 0) {
    throw new Error('Question count must divide evenly across the four chambers');
  }
  const perChamber = count / chambers;
  const random = seededRandom(hashString(`${roomId}:deal`));
  const picked = [];
  for (let sector = 0; sector < chambers; sector++) {
    const candidates = pool.filter(q => q.sector === sector);
    if (candidates.length < perChamber) {
      throw new Error(`Chamber ${sector} has only ${candidates.length} cards`);
    }
    picked.push(...shuffle(candidates, random).slice(0, perChamber));
  }
  return picked;
}
