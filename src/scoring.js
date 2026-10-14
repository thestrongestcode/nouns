// Pure scoring helpers for the UI. No DOM access here, so they can be unit tested.

// Ranks players by score. Players with equal scores share a rank (1, 1, 3 ...).
export function rankPlayers(players) {
  const sorted = players.slice().sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return sorted.map(player => {
    const sameScore = sorted.filter(other => other.score === player.score);
    return { ...player, rank: sorted.findIndex(other => other.score === player.score) + 1, tied: sameScore.length > 1 };
  });
}

// Teams are balanced to within one player, so comparing raw totals favors the bigger
// team. Compare average points per player instead.
export function teamSummary(players) {
  const summary = {};
  for (const team of ['A', 'B']) {
    const members = players.filter(p => p.team === team);
    const total = members.reduce((sum, p) => sum + p.score, 0);
    summary[team] = {
      count: members.length,
      total,
      average: members.length ? Math.round((total / members.length) * 10) / 10 : 0,
    };
  }
  const bothTeamsPlaying = summary.A.count > 0 && summary.B.count > 0;
  const leader = bothTeamsPlaying && summary.A.average !== summary.B.average
    ? (summary.A.average > summary.B.average ? 'A' : 'B')
    : null;
  return { ...summary, leader, tied: bothTeamsPlaying && leader === null };
}

export function ordinal(n) {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${n}th`;
  return n + ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
}

// "Ana", "Ana and Ben", "Ana, Ben and Cleo", "Ana, Ben, Cleo and 2 more"
export function joinNames(names, max = 3) {
  if (names.length <= 1) return names.join('');
  if (names.length <= max) return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
  return names.slice(0, max).join(', ') + ` and ${names.length - max} more`;
}
