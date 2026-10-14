// In-memory stand-in for the parts of Supabase the game uses. It mirrors supabase/schema.sql:
// unique constraints, the vault_submit and vault_control functions, and the event feed.
// Used by the tests, the local mock server, and the static Pages demo (which saves the tables
// to browser storage). If you change the SQL scoring or state rules, change them here too.

const newId = () => globalThis.crypto.randomUUID();

const UNIQUE = {
  vault_rooms: [['code']],
  vault_players: [['token_hash'], ['room_id', 'nickname']],
  vault_answers: [['player_id', 'question_index']],
  vault_events: [],
};

export function createMemoryDatabase(initial) {
  const tables = {
    vault_rooms: [], vault_players: [], vault_answers: [], vault_events: [],
    ...(initial || {}),
  };
  let offsetMs = 0;
  const maxId = rows => rows.reduce((n, r) => Math.max(n, Number(r.id) || 0), 0);
  let nextId = Math.max(maxId(tables.vault_answers), maxId(tables.vault_events));
  const now = () => Date.now() + offsetMs;
  const stamp = () => new Date(now()).toISOString();

  function withDefaults(table, row) {
    switch (table) {
      case 'vault_rooms':
        return {
          id: newId(), host_name: 'Teacher', status: 'lobby', mode: 'individual',
          question_count: 16, question_index: 0, seconds_per_question: 30,
          question_started_at: null, created_at: stamp(), ...row,
        };
      case 'vault_players':
        return { id: newId(), team: 'A', score: 0, joined_at: stamp(), ...row };
      case 'vault_answers':
        return { id: ++nextId, answered_at: stamp(), ...row };
      default:
        return { id: ++nextId, created_at: stamp(), ...row };
    }
  }

  class Query {
    constructor(table) {
      this.table = table;
      this.mode = 'select';
      this.filters = [];
      this.sorts = [];
      this.cols = null;
      this.row = null;
      this.one = null;
    }
    select(cols) { this.cols = cols; return this; }
    insert(row) { this.mode = 'insert'; this.row = row; return this; }
    eq(col, val) { this.filters.push([col, val]); return this; }
    order(col, { ascending = true } = {}) { this.sorts.push([col, ascending]); return this; }
    maybeSingle() { this.one = 'maybe'; return this; }
    single() { this.one = 'single'; return this; }
    then(resolve, reject) { return Promise.resolve(this.run()).then(resolve, reject); }

    run() {
      const rows = tables[this.table];
      if (this.mode === 'insert') {
        const row = withDefaults(this.table, this.row);
        for (const keys of UNIQUE[this.table]) {
          if (rows.some(r => keys.every(k => r[k] === row[k]))) {
            return { data: null, error: { code: '23505', message: 'duplicate key value violates unique constraint' } };
          }
        }
        rows.push(row);
        return this.finish([row]);
      }
      let found = rows.filter(r => this.filters.every(([c, v]) => r[c] === v));
      // Sort by the last key first; Array.sort is stable, so earlier keys win.
      for (const [col, asc] of [...this.sorts].reverse()) {
        found = found.slice().sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0) * (asc ? 1 : -1));
      }
      return this.finish(found);
    }

    finish(found) {
      const pick = row => (!this.cols || this.cols === '*')
        ? { ...row }
        : Object.fromEntries(this.cols.split(',').map(c => c.trim()).map(c => [c, row[c]]));
      const data = found.map(pick);
      if (this.one === 'maybe') return { data: data[0] ?? null, error: null };
      if (this.one === 'single') {
        return data.length === 1 ? { data: data[0], error: null } : { data: null, error: { message: 'Expected exactly one row' } };
      }
      return { data: this.mode === 'insert' && !this.cols ? null : data, error: null };
    }
  }

  const emit = roomId => tables.vault_events.push(withDefaults('vault_events', { room_id: roomId }));
  const findRoom = id => tables.vault_rooms.find(r => r.id === id);
  const elapsedSeconds = room => (now() - Date.parse(room.question_started_at)) / 1000;

  function submit({ p_room, p_player, p_question, p_choice, p_correct_choice }) {
    const room = findRoom(p_room);
    if (!room || room.status !== 'playing' || room.question_index !== p_question) {
      throw new Error('This question is no longer accepting answers');
    }
    if (elapsedSeconds(room) > room.seconds_per_question) throw new Error('Time is up for this question');
    const valid = n => Number.isInteger(n) && n >= 0 && n <= 3;
    if (!valid(p_choice) || !valid(p_correct_choice)) throw new Error('Invalid answer choice');
    if (!tables.vault_players.some(p => p.id === p_player && p.room_id === p_room)) throw new Error('Player not in room');
    if (tables.vault_answers.some(a => a.player_id === p_player && a.question_index === p_question)) {
      throw new Error('You already answered this question');
    }
    const correct = p_choice === p_correct_choice;
    const points = !correct ? 0 : elapsedSeconds(room) <= 10 ? 15 : 10;
    tables.vault_answers.push(withDefaults('vault_answers', {
      room_id: p_room, player_id: p_player, question_index: p_question, choice: p_choice, correct, points,
    }));
    emit(p_room);
  }

  function control({ p_room, p_action }) {
    const room = findRoom(p_room);
    if (!room) throw new Error('Room not found');
    const players = tables.vault_players.filter(p => p.room_id === room.id);
    const rescore = () => players.forEach(p => {
      p.score = tables.vault_answers.filter(a => a.player_id === p.id).reduce((n, a) => n + a.points, 0);
    });
    if (p_action === 'start') {
      if (room.status !== 'lobby') throw new Error('Game already started');
      if (!players.length) throw new Error('At least one student must join before starting');
      room.status = 'playing';
      room.question_started_at = stamp();
    } else if (p_action === 'reveal') {
      if (room.status !== 'playing') throw new Error('Nothing to reveal');
      rescore();
      room.status = 'reveal';
    } else if (p_action === 'next') {
      if (room.status !== 'reveal') throw new Error('Reveal the answer first');
      if (room.question_index + 1 >= room.question_count) {
        room.status = 'finished';
        room.question_index = room.question_count;
      } else {
        room.status = 'playing';
        room.question_index += 1;
        room.question_started_at = stamp();
      }
    } else if (p_action === 'finish') {
      if (!['playing', 'reveal'].includes(room.status)) throw new Error('No active game');
      rescore();
      room.status = 'finished';
    } else {
      throw new Error('Unknown host action');
    }
    emit(room.id);
  }

  return {
    tables,
    // Test helper: pretend this many seconds have passed.
    advance(seconds) { offsetMs += seconds * 1000; },
    from: table => new Query(table),
    rpc(name, args) {
      try {
        if (name === 'vault_submit') submit(args);
        else if (name === 'vault_control') control(args);
        else throw new Error('Unknown function ' + name);
        return Promise.resolve({ data: null, error: null });
      } catch (err) {
        return Promise.resolve({ data: null, error: { message: err.message } });
      }
    },
  };
}
