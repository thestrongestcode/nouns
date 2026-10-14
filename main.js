import './styles.css';
import { createClient } from '@supabase/supabase-js';

const app = document.querySelector('#app');
const statusText = document.querySelector('#status-label');
const KEY = 'word-vault-multiplayer-session-v1';
const STAGES = ['Noun Forge','Pronoun Portal','Repair Lab','Master Lock'];
const marks = ['A','B','C','D'];
const DEFAULT_ROOM = new URLSearchParams(location.search).get('room')?.toUpperCase() || '';

let session = null;
try { session = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch {}
let snapshot = null;
let client = null;
let channel = null;
let poller = null;
let ticker = null;
let errorNotice = '';
let sending = false;
let lastFetch = 0;

const escape = val => String(val ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const highlighted = (text, target) => {
  if (!target) return escape(text);
  const at = text.toLowerCase().indexOf(target.toLowerCase());
  if (at < 0) return escape(text);
  return escape(text.slice(0,at)) + '<mark>' + escape(text.slice(at,at+target.length)) + '</mark>' + escape(text.slice(at+target.length));
};

async function api(action, data={}) {
  const resp = await fetch('/api/game', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...data})});
  const json = await resp.json().catch(()=>({error:'The server returned an invalid response.'}));
  if (!resp.ok) throw new Error(json.error || 'Server error');
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
  return Math.max(0,Math.ceil(s.seconds - (Date.now() - Date.parse(s.startedAt)) / 1000));
}
function setStatus(text){statusText.textContent=text;}
function saveSession(v) {session=v;localStorage.setItem(KEY,JSON.stringify(v));}
function clearSession() {
  if (channel && client) client.removeChannel(channel);
  channel = null;
  clearInterval(poller);
  clearInterval(ticker);
  localStorage.removeItem(KEY);
  session=null;snapshot=null;sending=false;clearError();
  history.replaceState(null,'',location.pathname);
  setStatus('Ready to play');render();
}
function badge(text,cls=''){return `<span class="chip ${cls}">${escape(text)}</span>`;}
function stageCards(s) {
  const active=Math.min(3,Math.floor(s.index / 8));
  return `<div class="stages">${STAGES.map((name,i)=>`<div class="stage ${i<active?'completed':i===active?'active':''} ${s.questionCount===16&&i>1?'hidden-stage':''}"><small>CHAMBER ${String(i+1).padStart(2,'0')}</small><strong>${escape(name)}</strong><span>${i<active?'✓ Complete':i===active?'● In progress':s.questionCount===16&&i>1?'Full vault only':'Locked'}</span></div>`).join('')}</div>`;
}
function scoreboard(s) {
  const rows=s.players.slice().sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
  let teams='';
  if(s.mode==='teams') {
    const totalA=rows.filter(x=>x.team==='A').reduce((n,p)=>n+p.score,0);
    const totalB=rows.filter(x=>x.team==='B').reduce((n,p)=>n+p.score,0);
    teams=`<div class="team-scores"><div class="team a"><small>TEAM A</small><b>${totalA}</b></div><div class="team b"><small>TEAM B</small><b>${totalB}</b></div></div>`;
  }
  return `<aside class="score-panel"><div class="panelhead"><h3>Leaderboard</h3>${badge(rows.length+' joined')}</div>${teams}<ol class="scores">${rows.map((p,i)=>`<li class="${p.id===s.selfId?'me':''}"><span class="rank">${i+1}</span><span class="player-name">${escape(p.name)} ${s.mode==='teams'?`<em>${p.team}</em>`:''}</span><b>${p.score}</b></li>`).join('') || '<li class="empty">Waiting for players…</li>'}</ol><p class="muted tiny">10 pts correct · +5 speed bonus if correct within 10 seconds. Scores update after each reveal.</p></aside>`;
}
function intro() {
  return `<section class="intro card">
    <div class="intro-copy"><div class="eyebrow">A LIVE CLASSROOM GRAMMAR CHALLENGE</div><h1>Crack the<br><span>Word Vault.</span></h1><p>32 original noun and pronoun puzzles. One shared room. Every student on their own device. Your grammar knowledge is the key.</p><div class="facts"><span>✳ 16 grammar types</span><span>⌁ 4 chambers</span><span>◉ Live leaderboard</span></div></div>
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
  const seconds=getSeconds(s);
  const stageLabel=q.chamber;
  const round=(s.index+1);
  const progress=(round/s.questionCount)*100;
  return `${headerRoom(s)}${stageCards(s)}<div class="content-grid"><section class="card play-card">
    <div class="question-head"><div>${badge(stageLabel)} ${badge(`CARD ${round} OF ${s.questionCount}`,'neutral')}</div><div class="timer ${seconds<=10&&!revealed?'urgent':''}" id="clock">${revealed?'✓ Revealed':`◷ ${seconds}s`}</div></div>
    <div class="progress"><div style="width:${progress}%"></div></div>
    <h2 class="prompt">${escape(q.prompt)}</h2>
    ${q.context?`<blockquote class="context">${highlighted(q.context,q.focus)}</blockquote>`:''}
    ${options(s)}
    ${revealed?`<div class="explanation"><div class="eyebrow">ANSWER EXPLAINED · ${escape(q.skill)}</div><strong>${marks[q.correct]}. ${escape(q.options[q.correct])}</strong><p>${escape(q.why)}</p><div class="discuss">DISCUSSION PROMPT: ${escape(q.discuss)}</div>${!host?`<p class="personal-result">${s.answered?`Your answer: ${s.myChoice===q.correct?'correct':'incorrect'} · +${q.myPoints} points`:'You did not answer this round.'}</p>`:''}</div>`:
      `<div class="response-state">${host?`<strong>${s.answersReceived} / ${s.players.length}</strong> answers submitted · Reveal when you're ready.`:s.answered?'✓ Answer locked! Waiting for the teacher to reveal.':seconds===0?'Time is up. Waiting for the teacher.':'Choose one answer before time runs out.'}</div>`}
    ${host?`<div class="controls"><button class="button primary" data-command="${revealed?'next':'reveal'}">${revealed?(round===s.questionCount?'Finish game →':'Next card →'):'Reveal answer →'}</button><button class="button outline" data-action="finish-confirm">End game</button></div>`:''}
  </section>${scoreboard(s)}</div>`;
}
function finished(s) {
  const winners=s.players.slice().sort((a,b)=>b.score-a.score);
  const top=winners[0];
  return `${headerRoom(s)}<div class="content-grid"><section class="card play-card result-card"><div class="victory">✳</div><div class="eyebrow">MISSION COMPLETE</div><h2>The vault is unlocked.</h2><p class="lead">Great work examining how nouns and pronouns function in real sentences.</p>${top?`<div class="winner"><small>TOP SCORE</small><strong>${escape(top.name)}</strong><span>${top.score} points</span></div>`:''}<div class="note"><b>Teacher debrief:</b> Ask students to defend one difficult answer. Reflexive vs. intensive pronouns and singular vs. possessive nouns are especially useful to revisit.</div>${s.report?.length?`<div class="mastery"><h3>Concepts to review</h3>${s.report.slice(0,5).map(x=>`<div><span>${escape(x.skill)}</span><b>${x.correct}/${x.total} correct</b></div>`).join('')}</div>`:`<p class="hint">No missed concepts were recorded — excellent work!</p>`}<button class="button primary" data-action="leave">Return to home</button></section>${scoreboard(s)}</div>`;
}
function render() {
  const s=snapshot;
  app.innerHTML=(s ? `<div class="room-wrap">${s.status==='lobby'?lobby(s):s.status==='finished'?finished(s):questionView(s)}<div class="bottomrow"><button class="smalllink" data-action="leave">Leave this room</button><span>Make your words count.</span></div></div>` : intro()) + errorBox();
}
function updateClock() {
  if(!snapshot || snapshot.status!=='playing') return;
  const el=document.getElementById('clock');
  if(!el) return;
  const seconds=getSeconds(snapshot);
  el.textContent=`◷ ${seconds}s`;
  el.classList.toggle('urgent',seconds<=10);
  if(seconds===0) {
    document.querySelectorAll('[data-choice]').forEach(b=>b.disabled=true);
    const note=document.querySelector('.response-state');
    if(note && snapshot.role==='player' && !snapshot.answered) note.textContent='Time is up. Waiting for the teacher.';
  }
}
async function refresh() {
  if(!session) return;
  const issued=++lastFetch;
  try {
    const data=await api('state', {code:session.code,token:session.token});
    if(issued!==lastFetch || !session) return;
    snapshot=data;clearError();render();updateClock();
    setStatus('Room '+data.code+' · connected');
    if(!channel) connectRealtime(data.roomId);
  } catch(err) {
    if(issued!==lastFetch) return;
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
