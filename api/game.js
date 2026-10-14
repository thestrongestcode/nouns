import { createClient } from '@supabase/supabase-js';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { QUESTIONS, CHAMBERS } from '../server/questions.js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SECRET = process.env.SUPABASE_SECRET_KEY;
const PUBLIC = process.env.SUPABASE_PUBLISHABLE_KEY;
let db;
function database() {
  if (!SUPABASE_URL || !SECRET) throw new Error('Server not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY in Vercel.');
  if (!db) db = createClient(SUPABASE_URL, SECRET, { auth: { autoRefreshToken: false, persistSession: false }});
  return db;
}
const hash = text => createHash('sha256').update(text).digest('hex');
const token = () => randomBytes(32).toString('hex');
const codeChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const roomCode = () => Array.from(randomBytes(6), n => codeChars[n % codeChars.length]).join('');
function isHashEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
function validation(ok, message) { if (!ok) throw Object.assign(new Error(message), { status: 400 }); }
function check(error) { if (error) throw new Error(error.message); }
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
async function getRoom(code) {
  const { data, error } = await database().from('vault_rooms').select('*').eq('code', code).maybeSingle();
  check(error);
  if (!data) throw Object.assign(new Error('Room not found. Check the code.'), {status:404});
  return data;
}
async function authorize(room, rawToken) {
  validation(typeof rawToken === 'string' && /^[a-f0-9]{64}$/.test(rawToken), 'This device has no valid session. Rejoin the room.');
  const hashed = hash(rawToken);
  if (isHashEqual(room.host_token_hash, hashed)) return { role: 'host', player: null };
  const { data, error } = await database().from('vault_players')
    .select('id,nickname,team').eq('room_id', room.id).eq('token_hash',hashed).maybeSingle();
  check(error);
  if (!data) throw Object.assign(new Error('Session expired or invalid. Rejoin with another name.'), {status:403});
  return { role: 'player', player: data };
}
async function emit(roomId) {
  const { error } = await database().from('vault_events').insert({room_id:roomId});
  check(error);
}
async function createGame(body) {
  const hostName = sanitizeName(body.name || 'Teacher');
  validation([16,32].includes(body.length), 'Choose 16 or 32 questions');
  validation(['individual','teams'].includes(body.mode), 'Choose individual or team scoring');
  validation(Number.isInteger(body.seconds) && body.seconds >= 15 && body.seconds <= 90, 'Choose 15–90 seconds per question');
  const secret = token();
  for (let i=0;i<8;i++) {
    const code = roomCode();
    const {data,error} = await database().from('vault_rooms').insert({
      code, host_token_hash:hash(secret), host_name:hostName, mode:body.mode,
      question_count:body.length,seconds_per_question:body.seconds
    }).select('id,code').single();
    if (!error) return { code:data.code, token:secret, role:'host' };
    if (error.code !== '23505') check(error);
  }
  throw new Error('Could not generate an unused room code. Please retry.');
}
async function joinGame(body) {
  const code = sanitizeCode(body.code);
  const name = sanitizeName(body.name);
  const room = await getRoom(code);
  validation(room.status === 'lobby', 'This game has already started. Ask the host to start a new game.');
  const {data:players,error:playerError} = await database().from('vault_players')
    .select('id,team,nickname').eq('room_id',room.id);
  check(playerError);
  validation(players.length < 60, 'This room is full (60 students maximum).');
  validation(!players.some(p=>p.nickname.toLowerCase()===name.toLowerCase()), 'That nickname is taken in this room. Choose another.');
  const counts = {A:players.filter(x=>x.team==='A').length, B:players.filter(x=>x.team==='B').length};
  const team = counts.A <= counts.B ? 'A' : 'B';
  const secret = token();
  const {error} = await database().from('vault_players').insert({room_id:room.id,token_hash:hash(secret),nickname:name,team});
  if (error?.code==='23505') throw Object.assign(new Error('That nickname is taken. Choose another.'), {status:409});
  check(error);
  await emit(room.id);
  return {code,token:secret,role:'player'};
}
async function getState(body) {
  const code = sanitizeCode(body.code);
  const room = await getRoom(code);
  const auth = await authorize(room, body.token);
  const {data:players,error} = await database().from('vault_players')
    .select('id,nickname,team,score,joined_at').eq('room_id',room.id).order('score',{ascending:false}).order('joined_at',{ascending:true});
  check(error);
  const index = room.question_index;
  const question = room.status==='playing' || room.status==='reveal' ? QUESTIONS[index] : null;
  let answers = [];
  if (question) {
    const {data,error:ae}=await database().from('vault_answers').select('player_id,choice,correct,points')
      .eq('room_id',room.id).eq('question_index',index);
    check(ae);answers=data;
  }
  const mine = auth.player ? answers.find(a=>a.player_id===auth.player.id) : null;
  const revealed = room.status === 'reveal';
  let report = null;
  if (room.status === 'finished') {
    const {data:history,error:he} = await database().from('vault_answers')
      .select('question_index,correct').eq('room_id', room.id);
    check(he);
    const summaries = new Map();
    for (const answer of history) {
      const skill = QUESTIONS[answer.question_index]?.skill;
      if (!skill) continue;
      const current = summaries.get(skill) || {skill,total:0,correct:0};
      current.total++;
      if (answer.correct) current.correct++;
      summaries.set(skill,current);
    }
    report = [...summaries.values()].filter(r => r.correct < r.total)
      .sort((a,b)=>(a.correct/a.total)-(b.correct/b.total)||b.total-a.total);
  }
  return {
    code:room.code, roomId:room.id, hostName:room.host_name, role:auth.role, selfId:auth.player?.id || null,
    status:room.status,mode:room.mode,index,questionCount:room.question_count,
    seconds:room.seconds_per_question,startedAt:room.question_started_at,
    players:players.map(p=>({id:p.id,name:p.nickname,team:p.team,score:p.score})),
    answersReceived:answers.length, answered:!!mine, myChoice:mine?.choice ?? null,
    report,
    question:question ? {
      id:question.id,sector:question.sector,chamber:CHAMBERS[question.sector],
      prompt:question.prompt,context:question.context,focus:question.focus,options:question.options,
      ...(revealed? {correct:question.correct,skill:question.skill,why:question.why,discuss:question.discuss,counts:[0,1,2,3].map(i=>answers.filter(a=>a.choice===i).length),myPoints:mine?.points ?? 0} : {})
    } : null
  };
}
async function submit(body) {
  const room = await getRoom(sanitizeCode(body.code));
  const auth = await authorize(room, body.token);
  validation(auth.role==='player', 'Only students can submit answers');
  validation(Number.isInteger(body.choice) && body.choice >= 0 && body.choice <= 3, 'Choose an answer');
  const question = QUESTIONS[room.question_index];
  validation(room.status==='playing' && !!question, 'The question is not open');
  const {error} = await database().rpc('vault_submit', {
    p_room:room.id,p_player:auth.player.id,p_question:room.question_index,
    p_choice:body.choice,p_correct_choice:question.correct
  });
  check(error);
  return {ok:true};
}
async function control(body) {
  const room = await getRoom(sanitizeCode(body.code));
  const auth = await authorize(room,body.token);
  validation(auth.role==='host', 'Only the teacher can control the round');
  validation(['start','reveal','next','finish'].includes(body.command), 'Invalid control action');
  const {error} = await database().rpc('vault_control',{p_room:room.id,p_action:body.command});
  check(error);
  return {ok:true};
}
export default async function handler(req, res) {
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('X-Content-Type-Options','nosniff');
  if (req.method!=='POST') return res.status(405).json({error:'Use POST'});
  if (Number(req.headers['content-length'] || 0) > 8192) return res.status(413).json({error:'Request too large'});
  try {
    validation(req.body && typeof req.body==='object' && !Array.isArray(req.body), 'Invalid request');
    let result;
    switch(req.body.action) {
      case 'config': result={url:SUPABASE_URL || null,publishableKey:PUBLIC || null};break;
      case 'create':result=await createGame(req.body);break;
      case 'join':result=await joinGame(req.body);break;
      case 'state':result=await getState(req.body);break;
      case 'answer':result=await submit(req.body);break;
      case 'control':result=await control(req.body);break;
      default: throw Object.assign(new Error('Unknown action'),{status:400});
    }
    return res.status(200).json(result);
  } catch(err) {
    const status=err.status || (err.message?.startsWith('Server not configured')?503:400);
    // Hide Supabase/SQL internals except safe, known error messages.
    const known=/(already answered|no longer accepting|time is up|nothing to reveal|reveal the answer|no active game|game already started|at least one student|invalid answer|room not found|duplicate key)/i;
    const message=(err.status||known.test(err.message)||status===503) ? err.message : 'The request could not be completed. Check your database setup and try again.';
    if (!err.status && !known.test(err.message)) console.error('Word Vault API error:',err.message);
    return res.status(status).json({error:message});
  }
}
