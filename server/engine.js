// The complete game API, with no Node-only imports. It runs on Vercel (through api/game.js),
// in the local mock server, and in the browser for the static Pages demo.
// Callers pass a database object with the same shape as the Supabase client subset used here.
//
// Two ways to play a room:
//   phones: each student joins on their own device with the room code and answers there.
//   board:  one device (the teacher's) runs the game and is shared on the board. The teacher
//           enters each student's answer. Students never join, and there is no countdown.

import { QUESTIONS, CHAMBERS } from './questions.js';
import { optionOrder, shuffledCorrectIndex, pickRoomQuestions } from './game-logic.js';

const encoder = new TextEncoder();
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const BOARD_MAX_STUDENTS = 30;

const toHex = bytes => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
const randomHex = bytes => {
  const buffer = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(buffer);
  return toHex(buffer);
};
async function sha256(text) {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', encoder.encode(text));
  return toHex(new Uint8Array(digest));
}
// Compares two strings without stopping at the first difference.
function sameText(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
const roomCodeText = () => {
  const bytes = new Uint8Array(6);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, n => CODE_CHARS[n % CODE_CHARS.length]).join('');
};

function fail(message, status = 400) {
  return Object.assign(new Error(message), { status });
}
function validation(ok, message) {
  if (!ok) throw fail(message, 400);
}
function check(error) {
  if (error) throw new Error(error.message);
}
function sanitizeCode(v) {
  validation(typeof v === 'string' && /^[A-Z2-9]{6}$/.test(v.trim().toUpperCase()), 'Enter a valid six-character room code');
  return v.trim().toUpperCase();
}
function sanitizeName(v) {
  validation(typeof v === 'string', 'Enter a display name');
  const name = v.trim().replace(/\s+/g, ' ');
  validation(name.length >= 1 && name.length <= 24, 'Names must be 1–24 characters');
  validation(!/[<>\u0000-\u001F]/.test(name), 'Name contains invalid characters');
  return name;
}
// One student name per line. Names must be unique (ignoring capitals).
function parseRoster(value) {
  validation(typeof value === 'string', 'Enter the student names, one per line');
  const names = [];
  const seen = new Set();
  for (const line of value.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const name = sanitizeName(line);
    if (seen.has(name.toLowerCase())) throw fail(`"${name}" is listed twice. Each student needs a unique name.`, 400);
    seen.add(name.toLowerCase());
    names.push(name);
  }
  validation(names.length >= 1, 'Enter at least one student name');
  validation(names.length <= BOARD_MAX_STUDENTS, `One device supports up to ${BOARD_MAX_STUDENTS} students`);
  return names;
}

async function getRoom(db, code) {
  const { data, error } = await db.from('vault_rooms').select('*').eq('code', code).maybeSingle();
  check(error);
  if (!data) throw fail('Room not found. Check the code.', 404);
  return data;
}

async function authorize(db, room, rawToken) {
  validation(typeof rawToken === 'string' && /^[a-f0-9]{64}$/.test(rawToken), 'This device has no valid session. Rejoin the room.');
  const hashed = await sha256(rawToken);
  if (sameText(room.host_token_hash, hashed)) return { role: 'host', player: null };
  const { data, error } = await db.from('vault_players')
    .select('id,nickname,team').eq('room_id', room.id).eq('token_hash', hashed).maybeSingle();
  check(error);
  if (!data) throw fail('Session expired or invalid. Rejoin with another name.', 403);
  return { role: 'player', player: data };
}

// The cards for a room, in play order. Derived from the room id, so nothing extra is stored.
const roomCards = room => pickRoomQuestions(QUESTIONS, room.id, room.question_count);

async function emit(db, roomId) {
  const { error } = await db.from('vault_events').insert({ room_id: roomId });
  check(error);
}

async function createGame(db, body) {
  const hostName = sanitizeName(body.name || 'Teacher');
  validation([16, 32].includes(body.length), 'Choose 16 or 32 questions');
  validation(['individual', 'teams'].includes(body.mode), 'Choose individual or team scoring');
  validation(['phones', 'board'].includes(body.input || 'phones'), 'Choose where students answer');
  const input = body.input || 'phones';
  validation(Number.isInteger(body.seconds) && body.seconds >= 15 && body.seconds <= 90, 'Choose 15–90 seconds per question');
  const roster = input === 'board' ? parseRoster(body.roster) : null;
  const secret = randomHex(32);
  const hostHash = await sha256(secret);
  for (let i = 0; i < 8; i++) {
    const code = roomCodeText();
    const { data, error } = await db.from('vault_rooms').insert({
      code, host_token_hash: hostHash, host_name: hostName, mode: body.mode, input,
      question_count: body.length, seconds_per_question: body.seconds,
    }).select('id,code').single();
    if (error) {
      if (error.code !== '23505') check(error);
      continue;
    }
    if (roster) {
      // Students on a board have no device, so their rows get a random token nobody holds.
      const counts = { A: 0, B: 0 };
      for (const name of roster) {
        const team = counts.A <= counts.B ? 'A' : 'B';
        counts[team]++;
        const { error: playerError } = await db.from('vault_players').insert({
          room_id: data.id, token_hash: await sha256(randomHex(32)), nickname: name, team,
        });
        check(playerError);
      }
    }
    return { code: data.code, token: secret, role: 'host' };
  }
  throw new Error('Could not generate an unused room code. Please retry.');
}

async function joinGame(db, body) {
  const code = sanitizeCode(body.code);
  const name = sanitizeName(body.name);
  const room = await getRoom(db, code);
  validation(room.input !== 'board', 'This game is shared on one device. Students do not join from their own devices.');
  validation(room.status === 'lobby', 'This game has already started. Ask the host to start a new game.');
  const { data: players, error: playerError } = await db.from('vault_players')
    .select('id,team,nickname').eq('room_id', room.id);
  check(playerError);
  validation(players.length < 60, 'This room is full (60 students maximum).');
  validation(!players.some(p => p.nickname.toLowerCase() === name.toLowerCase()), 'That nickname is taken in this room. Choose another.');
  const counts = { A: players.filter(x => x.team === 'A').length, B: players.filter(x => x.team === 'B').length };
  const team = counts.A <= counts.B ? 'A' : 'B';
  const secret = randomHex(32);
  const { error } = await db.from('vault_players').insert({ room_id: room.id, token_hash: await sha256(secret), nickname: name, team });
  if (error?.code === '23505') throw fail('That nickname is taken. Choose another.', 409);
  check(error);
  await emit(db, room.id);
  return { code, token: secret, role: 'player' };
}

async function getState(db, body) {
  const code = sanitizeCode(body.code);
  const room = await getRoom(db, code);
  const auth = await authorize(db, room, body.token);
  const cards = roomCards(room);
  const { data: players, error } = await db.from('vault_players')
    .select('id,nickname,team,score,joined_at').eq('room_id', room.id).order('score', { ascending: false }).order('joined_at', { ascending: true });
  check(error);
  const index = room.question_index;
  const card = room.status === 'playing' || room.status === 'reveal' ? cards[index] : null;
  let answers = [];
  if (card) {
    const { data, error: answersError } = await db.from('vault_answers').select('player_id,choice,correct,points')
      .eq('room_id', room.id).eq('question_index', index);
    check(answersError);
    answers = data;
  }
  const order = card ? optionOrder(room.id, card.id) : null;
  const mine = auth.player ? answers.find(a => a.player_id === auth.player.id) : null;
  const revealed = room.status === 'reveal';
  let report = null;
  let myResult = null;
  if (room.status === 'finished') {
    const { data: history, error: historyError } = await db.from('vault_answers')
      .select('player_id,question_index,correct').eq('room_id', room.id);
    check(historyError);
    if (auth.player) {
      const own = history.filter(a => a.player_id === auth.player.id);
      myResult = { answered: own.length, correct: own.filter(a => a.correct).length };
    }
    const summaries = new Map();
    for (const answer of history) {
      const skill = cards[answer.question_index]?.skill;
      if (!skill) continue;
      const current = summaries.get(skill) || { skill, total: 0, correct: 0 };
      current.total++;
      if (answer.correct) current.correct++;
      summaries.set(skill, current);
    }
    report = [...summaries.values()].filter(r => r.correct < r.total)
      .sort((a, b) => (a.correct / a.total) - (b.correct / b.total) || b.total - a.total);
  }
  return {
    code: room.code, roomId: room.id, hostName: room.host_name, role: auth.role, selfId: auth.player?.id || null,
    status: room.status, mode: room.mode, input: room.input || 'phones', index, questionCount: room.question_count,
    seconds: room.seconds_per_question, startedAt: room.question_started_at,
    players: players.map(p => ({ id: p.id, name: p.nickname, team: p.team, score: p.score })),
    answersReceived: answers.length, answered: !!mine, myChoice: mine?.choice ?? null,
    // The teacher's view of each student's entry for the current card (board mode only).
    entries: auth.role === 'host' && card ? answers.map(a => ({
      playerId: a.player_id, choice: a.choice, ...(revealed ? { correct: a.correct } : {}),
    })) : undefined,
    report, myResult,
    // Cards actually played. A game ended early stops on the current card.
    playedCount: room.status === 'finished' ? Math.min(room.question_count, index + 1) : null,
    serverTime: Date.now(),
    question: card ? {
      id: card.id, sector: card.sector, chamber: CHAMBERS[card.sector],
      prompt: card.prompt, context: card.context, focus: card.focus, hint: card.hint,
      options: order.map(i => card.options[i]),
      ...(revealed ? {
        correct: shuffledCorrectIndex(order, card.correct),
        skill: card.skill, why: card.why, discuss: card.discuss,
        counts: [0, 1, 2, 3].map(i => answers.filter(a => a.choice === i).length),
        myPoints: mine?.points ?? 0,
      } : {}),
    } : null,
  };
}

async function submit(db, body) {
  const room = await getRoom(db, sanitizeCode(body.code));
  const auth = await authorize(db, room, body.token);
  validation(auth.role === 'player', 'Only students can submit answers');
  validation(Number.isInteger(body.choice) && body.choice >= 0 && body.choice <= 3, 'Choose an answer');
  validation((room.input || 'phones') === 'phones', 'The teacher enters answers for this game');
  const card = roomCards(room)[room.question_index];
  validation(room.status === 'playing' && !!card, 'The question is not open');
  const { error } = await db.rpc('vault_submit', {
    p_room: room.id,
    p_player: auth.player.id,
    p_question: room.question_index,
    p_choice: body.choice,
    p_correct_choice: shuffledCorrectIndex(optionOrder(room.id, card.id), card.correct),
  });
  check(error);
  return { ok: true };
}

// Board mode: the teacher records (or clears, with choice null) a student's answer.
async function enterAnswer(db, body) {
  const room = await getRoom(db, sanitizeCode(body.code));
  const auth = await authorize(db, room, body.token);
  validation(auth.role === 'host', 'Only the teacher can enter answers');
  validation(room.input === 'board', 'Students answer on their own devices in this game');
  validation(typeof body.playerId === 'string' && /^[0-9a-f-]{36}$/i.test(body.playerId), 'Choose a student');
  validation(body.choice === null || (Number.isInteger(body.choice) && body.choice >= 0 && body.choice <= 3), 'Choose an answer');
  const card = roomCards(room)[room.question_index];
  validation(room.status === 'playing' && !!card, 'The question is not open');
  const { error } = await db.rpc('vault_board_answer', {
    p_room: room.id,
    p_player: body.playerId,
    p_question: room.question_index,
    p_choice: body.choice,
    p_correct_choice: shuffledCorrectIndex(optionOrder(room.id, card.id), card.correct),
  });
  check(error);
  return { ok: true };
}

async function control(db, body) {
  const room = await getRoom(db, sanitizeCode(body.code));
  const auth = await authorize(db, room, body.token);
  validation(auth.role === 'host', 'Only the teacher can control the round');
  validation(['start', 'reveal', 'next', 'finish'].includes(body.command), 'Invalid control action');
  const { error } = await db.rpc('vault_control', { p_room: room.id, p_action: body.command });
  check(error);
  return { ok: true };
}

// Turn any thrown error into an HTTP status and a message that is safe to show.
function errorResponse(err) {
  const status = err.status || (err.message?.startsWith('Server not configured') ? 503 : 400);
  const known = /(already answered|no longer accepting|time is up|nothing to reveal|reveal the answer|no active game|game already started|at least one student|invalid answer|room not found|duplicate key|not in room|shared on one device|teacher enters)/i;
  const safe = err.status || known.test(err.message) || status === 503;
  if (!safe) console.error('Word Vault error:', err.message);
  return {
    status,
    json: { error: safe ? err.message : 'The request could not be completed. Check your database setup and try again.' },
  };
}

// body: the parsed request, with an `action` field.
// options.getDb: returns the database (called only when needed, so `config` works without one).
// options.supabaseUrl / publishableKey: sent to the browser for live updates (null in the demo).
export async function handleRequest(body, { getDb, supabaseUrl = null, publishableKey = null } = {}) {
  try {
    validation(body && typeof body === 'object' && !Array.isArray(body), 'Invalid request');
    if (body.action === 'config') return { status: 200, json: { url: supabaseUrl, publishableKey } };
    const db = getDb();
    let json;
    switch (body.action) {
      case 'create': json = await createGame(db, body); break;
      case 'join': json = await joinGame(db, body); break;
      case 'state': json = await getState(db, body); break;
      case 'answer': json = await submit(db, body); break;
      case 'enterAnswer': json = await enterAnswer(db, body); break;
      case 'control': json = await control(db, body); break;
      default: throw fail('Unknown action', 400);
    }
    return { status: 200, json };
  } catch (err) {
    return errorResponse(err);
  }
}
