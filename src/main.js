import './styles.css';
import { createClient } from '@supabase/supabase-js';
import { rankPlayers, teamSummary, ordinal, joinNames } from './scoring.js';

const app = document.querySelector('#app');
const statusText = document.querySelector('#status-label');
const KEY = 'word-vault-multiplayer-session-v1';
const STORE = __DEMO__ ? sessionStorage : localStorage;
let hintOpen = false;
let hintKey = '';
const STAGES = ['Noun Forge','Pronoun Portal','Repair Lab','Master Lock'];
const marks = ['A','B','C','D'];
let DEFAULT_ROOM = new URLSearchParams(location.search).get('room')?.toUpperCase() || '';

let session = null;
try { session = JSON.parse(STORE.getItem(KEY) || 'null'); } catch {}
let snapshot = null;
let client = null;
let channel = null;
let poller = null;
let ticker = null;
let errorNotice = '';
let sending = false;
let lastFetch = 0;
let clockSkew = 0; // server time minus this device's time, so a wrong device clock cannot break the timer
let lastSignature = '';
let lastTimeUpKey = '';
const announcer = document.querySelector('#announcer');

const escape = val => String(val ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const highlighted = (text, target) => {
  if (!target) return escape(text);
  const at = text.toLowerCase().indexOf(target.toLowerCase());
  if (at < 0) return escape(text);
  return escape(text.slice(0,at)) + '<mark>' + escape(text.slice(at,at+target.length)) + '</mark>' + escape(text.slice(at+target.length));
};

async function api(action, data={}) {
  if (__DEMO__) {
    const { demoRequest } = await import('./demo-api.js');
    const { status, json } = await demoRequest({ action, ...data });
    if (status >= 400) throw Object.assign(new Error(json.error || 'Server error'), { status });
    return json;
  }
  const resp = await fetch('/api/game', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...data})});
  const json = await resp.json().catch(()=>null);
  if (!json) {
    const missing = resp.status === 404 || resp.status === 405;
    throw Object.assign(new Error(missing
      ? 'The game server was not found. This site needs the Vercel deployment with the /api folder; GitHub Pages cannot run it (see the README).'
      : 'The server returned an invalid response.'), {status: resp.status});
  }
  if (!resp.ok) throw Object.assign(new Error(json.error || 'Server error'), {status: resp.status});
  return json;
}

function showError(err) {
  errorNotice = err?.message || String(err);
  const box = document.getElementById('error');
  if (box) { box.hidden=false;box.textContent=errorNotice; }
  else render();
}
function clearError() { errorNotice=''; }
function errorBox(){ return `<div id="error" role="alert" class="notice error" ${errorNotice?'':'hidden'}>${escape(errorNotice)}</div>`; }
function getSeconds(s) {
  if (!s.startedAt) return s.seconds;
  return Math.max(0,Math.ceil(s.seconds - (Date.now() + clockSkew - Date.parse(s.startedAt)) / 1000));
}
function setStatus(text){statusText.textContent=text;}
function saveSession(v) {session=v;STORE.setItem(KEY,JSON.stringify(v));}
function clearSession() {
  if (channel && client) client.removeChannel(channel);
  channel = null;
  clearInterval(poller);
  clearInterval(ticker);
  STORE.removeItem(KEY);
  session=null;snapshot=null;sending=false;clearError();
  DEFAULT_ROOM='';lastSignature='';lastTimeUpKey='';clockSkew=0;
  history.replaceState(null,'',location.pathname);
  setStatus('Ready to play');render();
}
function badge(text,cls=''){return `<span class="chip ${cls}">${escape(text)}</span>`;}
function stageCards(s) {
  const current = s.question ? s.question.sector : STAGES.length;
  return `<div class="stages">${STAGES.map((name,i)=>{
    const state = i<current ? 'completed' : i===current ? 'active' : '';
    const label = i<current ? '✓ Complete' : i===current ? '● In progress' : 'Locked';
    return `<div class="stage ${state}"><small>CHAMBER ${String(i+1).padStart(2,'0')}</small><strong>${escape(name)}</strong><span>${label}</span></div>`;
  }).join('')}</div>`;
}
function scoreboard(s) {
  const rows=rankPlayers(s.players);
  const noScoresYet=rows.every(p=>p.score===0); // everyone is tied at 0, so ranks would all read "1"
  let teams='';
  if(s.mode==='teams') {
    const t=teamSummary(s.players);
    const card=key=>`<div class="team ${key.toLowerCase()} ${t.leader===key?'leading':''}"><small>TEAM ${key}</small><b>${t[key].average.toFixed(1)}</b><span>avg per player</span><span>${t[key].count} ${t[key].count===1?'player':'players'} · ${t[key].total} pts</span></div>`;
    teams=`<div class="team-scores">${card('A')}${card('B')}</div>`;
  }
  return `<aside class="score-panel"><div class="panelhead"><h3>Leaderboard</h3>${badge(rows.length+' joined')}</div>${teams}<ol class="scores">${rows.map(p=>`<li class="${p.id===s.selfId?'me':''}"><span class="rank">${noScoresYet?'–':p.rank}</span><span class="player-name">${escape(p.name)} ${s.mode==='teams'?`<em>${p.team}</em>`:''}</span><b>${p.score}</b></li>`).join('') || '<li class="empty">Waiting for players…</li>'}</ol><p class="muted tiny">10 pts correct · +5 speed bonus if correct within 10 seconds. Scores update after each reveal.${s.mode==='teams'?' Teams are compared by average points per player.':''}</p></aside>`;
}
function intro() {
  return `<section class="intro card">
    <div class="intro-copy"><div class="eyebrow">A LIVE CLASSROOM GRAMMAR CHALLENGE</div><h1>Crack the<br><span>Word Vault.</span></h1><p>64 noun and pronoun puzzles, with a different mix in every game. One shared room. Every student on their own device. Your grammar knowledge is the key.</p><div class="facts"><span>✳ 16 grammar types</span><span>⌁ 4 chambers</span><span>◉ Live leaderboard</span></div></div>
    <div class="vault-visual" aria-hidden="true"><div class="orbital one"></div><div class="orbital two"></div><div class="core">✳</div><div class="spark top"></div><div class="spark bottom"></div></div>
  </section>
  <section class="entry-grid">
    <form class="card entry" id="join-form"><div class="entry-icon">↗</div><h2>Join a game</h2><p>Enter the six-character code shown on your teacher's screen.</p><label for="join-room">ROOM CODE</label><input id="join-room" name="code" placeholder="ABC123" maxlength="6" autocomplete="off" spellcheck="false" value="${escape(DEFAULT_ROOM)}" required /><label for="join-name">YOUR NAME</label><input id="join-name" name="name" maxlength="24" placeholder="Choose a nickname" autocomplete="nickname" required/><button class="button primary full" type="submit">Enter the vault →</button></form>
    <form class="card entry" id="host-form"><div class="entry-icon host-icon">✳</div><h2>Host a classroom</h2><p>Control the rounds and project the live scores for everyone.</p><label for="host-name">HOST NAME</label><input id="host-name" name="name" maxlength="24" value="Teacher" required/><div class="selectors"><div><label for="length">QUESTIONS</label><select id="length" name="length"><option value="16">Quick · 16</option><option value="32" selected>Full · 32</option></select></div><div><label for="seconds">TIME LIMIT</label><select id="seconds" name="seconds"><option value="20">20 seconds</option><option value="30" selected>30 seconds</option><option value="45">45 seconds</option><option value="60">60 seconds</option></select></div></div><label for="mode">SCORING MODE</label><select id="mode" name="mode"><option value="individual">Individual players</option><option value="teams">Two auto-balanced teams</option></select><button class="button dark full" type="submit">Create game →</button></form>
  </section>
  <div class="intro-foot">No student accounts needed. The teacher hosts a room, shares the code, and starts the game when everyone is ready.</div>`;
}
function headerRoom(s) {
  return `<div class="roomheading"><div><div class="eyebrow">WORD VAULT / LIVE ROOM</div><h1>${s.status==='lobby'?'The lobby':s.status==='finished'?'The vault is open!':s.status==='reveal'?'The answer revealed':'Unlock the next clue'}</h1><p>${s.role==='host'?'Teacher dashboard':'Student game screen'} · Hosted by ${escape(s.hostName)}</p></div><div class="roomcode"><small>JOIN CODE</small><strong>${escape(s.code)}</strong><button class="textlink" data-action="copy-link" type="button">Copy invite link ↗</button></div></div>`;
}
function lobby(s) {
  const host=s.role==='host';
  return `${headerRoom(s)}<div class="content-grid"><section class="card play-card">
    <div class="mini-heading">${badge('PREPARING MISSION','orange')} ${badge(s.mode==='teams'?'Two teams':'Individual scores')}</div><h2>${host?'Invite your players':'You are in!'}</h2><p class="lead">${host?'Share the room code or invite link, then start once students have joined.':'Your teacher will begin the challenge. Keep this tab open.'}</p>
    <div class="bigcode">${escape(s.code)}</div><p class="hint">${host?'Students can join at this website using this code.':'You are connected and ready for the first question.'}</p>
    <div class="configuration"><div><small>QUESTION CARDS</small><strong>${s.questionCount}</strong></div><div><small>ROUND TIMER</small><strong>${s.seconds}s</strong></div><div><small>PLAYERS</small><strong>${s.players.length}/60</strong></div></div>
    ${host?`<div class="controls"><button class="button primary" data-command="start" ${s.players.length===0?'disabled':''}>Start challenge →</button><button class="button outline" data-action="copy-link">Copy invite</button></div><p class="tiny muted">You can start as soon as at least one student has joined.</p>`:`<div class="waiting"><span class="pulse"></span> Waiting for the teacher to start…</div>`}
  </section>${scoreboard(s)}</div>`;
}
function options(s) {
  const q=s.question;
  if (!q) return '';
  const shown=s.status==='reveal';
  return `<div class="choices">${q.options.map((answer,i)=>{
    let cls='';
    if (shown && i===q.correct) cls='correct';
    else if (shown && s.myChoice===i) cls='incorrect';
    else if (s.myChoice===i) cls='selected';
    let count = shown?`<span class="choice-count">${q.counts[i]} vote${q.counts[i]===1?'':'s'}</span>`:'';
    return `<button class="choice ${cls}" data-choice="${i}" ${s.role==='host'||s.answered||shown||getSeconds(s)===0||sending?'disabled':''}><span class="choice-letter">${marks[i]}</span><span class="answer-text">${escape(answer)}</span>${count}</button>`;
  }).join('')}</div>`;
}
function questionView(s) {
  const q=s.question,host=s.role==='host',revealed=s.status==='reveal';
  const cardKey=`${s.code}:${s.index}`;
  if(hintKey!==cardKey){hintKey=cardKey;hintOpen=false;}
  const aidsHtml=`<div class="aids"><button class="textlink" data-action="read" type="button">Read aloud</button>${q.hint?`<button class="textlink" data-action="hint" type="button" aria-expanded="${hintOpen}">${hintOpen?'Hide hint':'Need a hint?'}</button>`:''}</div>${hintOpen&&q.hint?`<div class="hint-box"><b>Hint:</b> ${escape(q.hint)}</div>`:''}`;
  const seconds=getSeconds(s);
  const stageLabel=q.chamber;
  const round=(s.index+1);
  const progress=(round/s.questionCount)*100;
  return `${headerRoom(s)}${stageCards(s)}<div class="content-grid"><section class="card play-card">
    <div class="question-head"><div>${badge(stageLabel)} ${badge(`CARD ${round} OF ${s.questionCount}`,'neutral')}</div><div class="timer ${seconds<=10&&!revealed?'urgent':''}" id="clock">${revealed?'✓ Revealed':`◷ ${seconds}s`}</div></div>
    <div class="progress"><div style="width:${progress}%"></div></div>
    <h2 class="prompt">${escape(q.prompt)}</h2>
    ${q.context?`<blockquote class="context">${highlighted(q.context,q.focus)}</blockquote>`:''}
    ${aidsHtml}
    ${options(s)}
    ${revealed?`<div class="explanation"><div class="eyebrow">ANSWER EXPLAINED · ${escape(q.skill)}</div><strong>${marks[q.correct]}. ${escape(q.options[q.correct])}</strong><p>${escape(q.why)}</p><div class="discuss">DISCUSSION PROMPT: ${escape(q.discuss)}</div>${!host?`<p class="personal-result">${s.answered?`Your answer: ${s.myChoice===q.correct?'correct':'incorrect'} · +${q.myPoints} points`:'You did not answer this round.'}</p>`:''}</div>`:
      `<div class="response-state">${host?`<strong>${s.answersReceived} / ${s.players.length}</strong> answers submitted · Reveal when you're ready.`:s.answered?'✓ Answer locked! Waiting for the teacher to reveal.':seconds===0?'Time is up. Waiting for the teacher.':'Choose one answer before time runs out.'}</div>`}
    ${host?`<div class="controls"><button class="button primary" data-command="${revealed?'next':'reveal'}">${revealed?(round===s.questionCount?'Finish game →':'Next card →'):'Reveal answer →'}</button><button class="button outline" data-action="finish-confirm">End game</button></div>`:''}
  </section>${scoreboard(s)}</div>`;
}
function finished(s) {
  const ranked=rankPlayers(s.players);
  const best=ranked.filter(p=>p.rank===1);
  const me=ranked.find(p=>p.id===s.selfId);
  const teams=s.mode==='teams'?teamSummary(s.players):null;
  const host=s.role==='host';
  const myCard=me&&s.myResult?`<div class="my-result"><small>YOUR RESULT</small><strong>${me.tied?'Tied for ':''}${ordinal(me.rank)} of ${ranked.length}</strong><span>${me.score} points · ${s.myResult.correct} of ${s.playedCount} correct</span></div>`:'';
  const winnerCard=best.length?`<div class="winner"><small>${best.length>1?'TIED FOR FIRST':'TOP SCORE'}</small><strong>${escape(joinNames(best.map(p=>p.name)))}</strong><span>${best[0].score} points</span></div>`:'';
  const teamCard=teams&&(teams.leader||teams.tied)?`<div class="team-result ${teams.leader?teams.leader.toLowerCase():''}"><small>TEAM RESULT</small><strong>${teams.leader?`Team ${teams.leader} wins`:'The teams tied'}</strong><span>Average points per player: Team A ${teams.A.average.toFixed(1)}, Team B ${teams.B.average.toFixed(1)}</span></div>`:'';
  const weakest=s.report?.[0]?.skill;
  const debrief=host?`<div class="note"><b>Teacher debrief:</b> ${weakest?`Most of the class missed items on <b>${escape(weakest)}</b>. Start the discussion there, then ask a student to defend an answer they found hard.`:'Ask a student to defend an answer they found hard.'}</div>`:'';
  return `${headerRoom(s)}<div class="content-grid"><section class="card play-card result-card"><div class="victory">✳</div><div class="eyebrow">MISSION COMPLETE</div><h2>The vault is unlocked.</h2><p class="lead">Great work examining how nouns and pronouns function in real sentences.</p>${myCard}${winnerCard}${teamCard}${debrief}${s.report?.length?`<div class="mastery"><h3>Concepts to review</h3>${s.report.slice(0,5).map(x=>`<div><span>${escape(x.skill)}</span><b>${x.correct}/${x.total} correct</b></div>`).join('')}</div>`:`<p class="hint">No missed concepts were recorded. Excellent work!</p>`}<button class="button primary" data-action="leave">Return to home</button></section>${scoreboard(s)}</div>`;
}
function focusSelector() {
  const el=document.activeElement;
  if(!el || el===app || !app.contains(el)) return '';
  const d=el.dataset||{};
  if(d.choice!==undefined) return `[data-choice="${d.choice}"]`;
  if(d.command) return `[data-command="${d.command}"]`;
  if(d.action) return `[data-action="${d.action}"]`;
  return el.id ? '#'+el.id : '';
}
function readAloud() {
  const q=snapshot?.question;
  if(!q || !('speechSynthesis' in window)) {showError(new Error('Read aloud is not available in this browser.'));return;}
  const text=[q.prompt,q.context,...q.options.map((o,i)=>`${marks[i]}. ${o}`)].filter(Boolean).join('. ');
  speechSynthesis.cancel();
  speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}
function demoNote() {
  return '<div class="notice demo-note" role="note">Practice build on GitHub Pages. Each tab is one device, and tabs in this browser share a room. For a real classroom with students on their own devices, use the Vercel version.</div>';
}
function render() {
  const s=snapshot;
  const keep=focusSelector();
  app.innerHTML=(__DEMO__?demoNote():'')+(s ? `<div class="room-wrap ${s.status} ${s.role}">${s.status==='lobby'?lobby(s):s.status==='finished'?finished(s):questionView(s)}<div class="bottomrow"><button class="smalllink" data-action="leave">Leave this room</button><span>Make your words count.</span></div></div>` : intro()) + errorBox();
  if(keep) app.querySelector(keep)?.focus({preventScroll:true});
}
function announce(text) {
  if(!announcer) return;
  announcer.textContent='';
  setTimeout(()=>{announcer.textContent=text;},50);
}
function announceChange(prev,next) {
  if(next.status==='playing' && (!prev || prev.status!=='playing' || prev.index!==next.index)) announce(`Card ${next.index+1} of ${next.questionCount}. ${getSeconds(next)} seconds.`);
  else if(next.status==='reveal' && prev?.status!=='reveal') announce(next.role==='player' ? (next.answered ? (next.myChoice===next.question.correct ? 'Answer revealed. You were correct.' : 'Answer revealed. You were not correct.') : 'Answer revealed. You did not answer.') : 'Answer revealed.');
  else if(next.status==='finished' && prev?.status!=='finished') announce('The game is over.');
}
function updateClock() {
  if(!snapshot || snapshot.status!=='playing') return;
  const el=document.getElementById('clock');
  if(!el) return;
  const seconds=getSeconds(snapshot);
  el.textContent=`◷ ${seconds}s`;
  el.classList.toggle('urgent',seconds<=10);
  if(seconds===0) {
    const key=snapshot.code+':'+snapshot.index;
    if(lastTimeUpKey!==key){lastTimeUpKey=key;announce('Time is up.');}
    document.querySelectorAll('[data-choice]').forEach(b=>b.disabled=true);
    const note=document.querySelector('.response-state');
    if(note && snapshot.role==='player' && !snapshot.answered) note.textContent='Time is up. Waiting for the teacher.';
  }
}
async function refresh() {
  if(!session) return;
  const issued=++lastFetch;
  try {
    const asked=Date.now();
    const data=await api('state', {code:session.code,token:session.token});
    if(issued!==lastFetch || !session) return;
    if(data.serverTime) clockSkew=data.serverTime-(asked+Date.now())/2;
    // Only rebuild the page when something changed. Rebuilding every poll threw away keyboard focus.
    const {serverTime,...stable}=data;
    const signature=JSON.stringify(stable);
    const hadError=!!errorNotice;
    const previous=snapshot;
    snapshot=data;clearError();
    if(signature!==lastSignature || hadError) {lastSignature=signature;render();announceChange(previous,data);}
    updateClock();
    setStatus('Room '+data.code+' · connected');
    if(!channel) connectRealtime(data.roomId);
  } catch(err) {
    if(issued!==lastFetch) return;
    if(err.status===403 || err.status===404) {
      clearSession();
      showError(new Error('That room is no longer available. Ask your teacher for a new code.'));
      return;
    }
    showError(err);
    setStatus('Connection issue · retrying');
  }
}
async function connectRealtime(roomId) {
  if(channel || !session) return;
  try {
    const config=await api('config');
    if (!session || !config.url || !config.publishableKey) return; // polling still works
    client=createClient(config.url,config.publishableKey,{auth:{persistSession:false,autoRefreshToken:false}});
    channel=client.channel('vault-room-'+roomId)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'vault_events',filter:'room_id=eq.'+roomId},()=>refresh())
      .subscribe();
  } catch(err) {console.warn('Realtime unavailable; periodic refresh still works.',err);}
}
function startWatching() {
  clearInterval(poller);clearInterval(ticker);
  ticker=setInterval(updateClock,250);
  poller=setInterval(refresh,6000); // fallback if a Realtime connection is interrupted
  refresh();
}
async function busyCall(operation) {
  if(sending) return;
  sending=true;clearError();
  try {await operation();await refresh();}
  catch(err){showError(err);}
  finally {sending=false;}
}

app.addEventListener('submit', async event=>{
  event.preventDefault();
  const form=event.target;
  if(!['join-form','host-form'].includes(form.id)) return;
  const values=Object.fromEntries(new FormData(form));
  if(form.id==='join-form') values.code=(values.code||'').trim().toUpperCase();
  await busyCall(async()=>{
    const data=await api(form.id==='join-form'?'join':'create',{
      ...values,
      ...(form.id==='host-form'?{length:Number(values.length),seconds:Number(values.seconds)}:{})
    });
    saveSession({code:data.code,token:data.token,role:data.role});
    history.replaceState(null,'','?room='+encodeURIComponent(data.code));
    startWatching();
  });
});
app.addEventListener('click', async event=>{
  const control=event.target.closest('[data-command],[data-action],[data-choice]');
  if(!control)return;
  if(control.dataset.action==='read'){readAloud();return;}
  if(control.dataset.action==='hint'){hintOpen=!hintOpen;render();return;}
  if(control.dataset.action==='leave'){clearSession();return;}
  if(control.dataset.action==='copy-link'){
    const link=location.origin+location.pathname+'?room='+encodeURIComponent(snapshot.code);
    try {await navigator.clipboard.writeText(link);control.textContent='✓ Copied link';}
    catch {showError(new Error('Could not copy automatically. Share this URL: '+link));}
    return;
  }
  if(control.dataset.action==='finish-confirm'){
    if(!confirm('End the game early and show final scores?')) return;
    await busyCall(()=>api('control',{code:session.code,token:session.token,command:'finish'}));
    return;
  }
  if(control.dataset.command) {
    await busyCall(()=>api('control',{code:session.code,token:session.token,command:control.dataset.command}));
    return;
  }
  if(control.dataset.choice!==undefined && !control.disabled && !sending) {
    const answer=Number(control.dataset.choice);
    await busyCall(()=>api('answer',{code:session.code,token:session.token,choice:answer}));
  }
});

if(session?.code && session?.token) {
  history.replaceState(null,'','?room='+encodeURIComponent(session.code));
  startWatching();
} else render();
