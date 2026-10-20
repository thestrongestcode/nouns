import './styles.css';
import { CHAMBERS } from './questions.js';
import { FLASHCARDS } from './flashcards.js';
import {
  buildGame, answer, nextCard, winner, debrief, countText, QUESTION_COUNTS, POINTS_PER_CORRECT,
} from './game.js';

// One device, shared on the board. The whole game lives in this page, so it can be saved
// in sessionStorage to survive a page refresh. Storage can fail (private windows, blocked
// storage), so every read and write is wrapped and the game still works without it.
const KEY = 'word-vault-board-v1';
const app = document.querySelector('#app');
const announcer = document.querySelector('#announcer');

const DEFAULT_SETUP = { teamA: 'Team 1', membersA: '', teamB: 'Team 2', membersB: '', count: 16 };
let view = { screen: 'home', setup: { ...DEFAULT_SETUP }, game: null, hint: false, error: '' };

function save() {
  try { sessionStorage.setItem(KEY, JSON.stringify(view)); } catch { /* storage is optional */ }
}

function restore() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (!saved || typeof saved !== 'object') return;
    view = { ...view, ...saved, setup: { ...DEFAULT_SETUP, ...(saved.setup || {}) } };
    // A damaged or outdated saved game would leave the board blank, so drop it and start at home.
    const g = view.game;
    const valid = g && Array.isArray(g.cards) && Array.isArray(g.teams) && g.teams.length === 2
      && Number.isInteger(g.index) && g.index >= 0 && g.index <= g.cards.length;
    if (!valid) view.game = null;
    if ((view.screen === 'board' || view.screen === 'finish') && !view.game) view.screen = 'home';
    if (view.screen === 'board' && view.game.index >= view.game.cards.length) view.screen = 'finish';
  } catch { /* start fresh */ }
}

const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
));

const capitalize = text => text.charAt(0).toUpperCase() + text.slice(1);

function readAloud(text) {
  try {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    speechSynthesis.speak(utterance);
  } catch { /* speech is optional */ }
}

function announce(text) {
  if (announcer) announcer.textContent = text;
}

// ---- Screens -------------------------------------------------------------

function renderHome() {
  return `
    <div class="home-stack">
    <section class="card home">
      <p class="eyebrow">Word Vault / Teacher board</p>
      <h1 tabindex="-1" data-focus>Unlock the next clue</h1>
      <p class="lead">A nouns and pronouns game for one screen. Two teams take turns. Each card shows a sentence, and the teams decide the answer together.</p>
      <div class="actions">
        <button class="button primary" data-action="setup">Set up a game</button>
        <button class="button outline" data-action="how">How to play</button>
        <a class="button text" href="#study">Study the flashcards</a>
      </div>
    </section>
    ${renderFlashcards()}
    </div>`;
}

// One flip card per noun and pronoun type. Flipping only toggles the card in place (no re-render),
// so keyboard focus stays on the card.
function flashcard(card) {
  let sentence = esc(card.sentence);
  sentence = sentence.replace(esc(card.focus), `<mark class="focus">${esc(card.focus)}</mark>`);
  const kind = card.group === 'Nouns' ? 'noun' : 'pronoun';
  return `
    <button class="flashcard ${kind}" type="button" data-action="flip" aria-pressed="false">
      <span class="face front">
        <span class="fc-group">${kind}</span>
        <span class="fc-name">${esc(capitalize(card.skill))}</span>
        <span class="fc-cue">Tap to flip</span>
      </span>
      <span class="face back" hidden>
        <span class="fc-title">${esc(capitalize(card.skill))}</span>
        <span class="fc-def">${esc(card.definition)}</span>
        <span class="fc-ex"><strong>Examples:</strong> ${card.examples.map(esc).join(', ')}</span>
        <span class="fc-sentence">${sentence}</span>
        <span class="fc-tip"><strong>Tip:</strong> ${esc(card.tip)}</span>
      </span>
    </button>`;
}

function renderFlashcards() {
  const group = name => FLASHCARDS.filter(c => c.group === name).map(flashcard).join('');
  return `
    <section class="card study" id="study" aria-labelledby="study-title">
      <p class="eyebrow">Study the types</p>
      <h2 id="study-title" class="study-title">Noun and pronoun flashcards</h2>
      <p class="study-lead">Tap a card to see what it means, with examples and a tip for spotting it. Tap it again to flip it back.</p>
      <div class="deck-controls">
        <button class="textlink" type="button" data-action="flip-all">Flip all</button>
        <button class="textlink" type="button" data-action="flip-none">Flip all back</button>
      </div>
      <h3 class="deck-title">Nouns</h3>
      <div class="deck">${group('Nouns')}</div>
      <h3 class="deck-title">Pronouns</h3>
      <div class="deck">${group('Pronouns')}</div>
    </section>`;
}

function setFlipped(button, flipped) {
  button.setAttribute('aria-pressed', String(flipped));
  button.classList.toggle('is-flipped', flipped);
  button.querySelector('.front').hidden = flipped;
  button.querySelector('.back').hidden = !flipped;
  button.classList.remove('is-turning');
  void button.offsetWidth; // restart the flip animation
  button.classList.add('is-turning');
}

function renderHow() {
  return `
    <section class="card how">
      <p class="eyebrow">Instructions</p>
      <h1 tabindex="-1" data-focus>How to play</h1>
      <ol class="steps">
        <li>
          <h2>Set up the teams</h2>
          <p>Name each team and list its members. Choose 16 cards for a quick game or 32 for a full game.</p>
        </li>
        <li>
          <h2>Take turns</h2>
          <p>The teams take turns. Team 1 gets the first card, Team 2 the second, and so on. Each team gets both kinds of card equally.</p>
        </li>
        <li>
          <h2>Read the board</h2>
          <p>There are two kinds of card. A <strong>label card</strong> highlights one word, and the question is "This highlighted word is...". Pick the full label, such as "a common noun." A <strong>word card</strong> has no highlight, and the question is "Which word in this sentence is a...?" Pick the word.</p>
        </li>
        <li>
          <h2>Answer together</h2>
          <p>The team talks it over. When it has decided, tap its answer on the board. Tap "No answer" if the team cannot decide.</p>
        </li>
        <li>
          <h2>Score</h2>
          <p>A correct answer is worth ${POINTS_PER_CORRECT} points. A wrong answer or no answer scores 0.</p>
        </li>
        <li>
          <h2>Discuss</h2>
          <p>After each answer, the board shows why the answer is right and a question for the class. Read it aloud and invite a student to explain.</p>
        </li>
        <li>
          <h2>Finish</h2>
          <p>The team with the most points wins. The last screen shows the concept most cards were missed on, so you know what to review.</p>
        </li>
      </ol>
      <div class="tips">
        <strong>Teacher tips:</strong> Keep the board visible the whole time. Use "Show hint" if a team is stuck. Use "Read aloud" to read the sentence and the choices to the room.
      </div>
      <div class="actions">
        <button class="button primary" data-action="setup">Set up a game</button>
        <button class="button outline" data-action="home">Back</button>
      </div>
    </section>`;
}

function renderSetup() {
  const s = view.setup;
  const options = QUESTION_COUNTS.map(n => `
    <label class="radio"><input type="radio" name="count" value="${n}" ${Number(s.count) === n ? 'checked' : ''}/>
    <span>${n === 16 ? 'Quick game: 16 cards' : 'Full game: 32 cards'}</span></label>`).join('');
  return `
    <section class="card setup">
      <p class="eyebrow">Set up</p>
      <h1 tabindex="-1" data-focus>Set up the teams</h1>
      <form id="setup-form" novalidate>
        <div class="teams-grid">
          <fieldset class="team-fields">
            <legend>Team 1</legend>
            <label for="teamA">Team name</label>
            <input id="teamA" name="teamA" maxlength="24" value="${esc(s.teamA)}" required />
            <label for="membersA">Members, one per line</label>
            <textarea id="membersA" name="membersA" rows="6" maxlength="800">${esc(s.membersA)}</textarea>
          </fieldset>
          <fieldset class="team-fields">
            <legend>Team 2</legend>
            <label for="teamB">Team name</label>
            <input id="teamB" name="teamB" maxlength="24" value="${esc(s.teamB)}" required />
            <label for="membersB">Members, one per line</label>
            <textarea id="membersB" name="membersB" rows="6" maxlength="800">${esc(s.membersB)}</textarea>
          </fieldset>
        </div>
        <fieldset class="counts">
          <legend>Length</legend>
          ${options}
        </fieldset>
        ${view.error ? `<p class="error" role="alert">${esc(view.error)}</p>` : ''}
        <div class="actions">
          <button class="button primary" type="submit">Start the game</button>
          <button class="button outline" type="button" data-action="how">How to play</button>
          <button class="button text" type="button" data-action="home">Back</button>
        </div>
      </form>
    </section>`;
}

function teamCard(team, isUp) {
  const members = team.members.length ? team.members.map(esc).join(', ') : 'No members listed';
  return `
    <div class="team-card ${isUp ? 'is-up' : ''}">
      <div class="team-top">
        <span class="team-name">${esc(team.name)}</span>
        ${isUp ? '<span class="up-tag">Up now</span>' : ''}
      </div>
      <div class="team-score">${team.score}<small>points</small></div>
      <div class="team-members">${members}</div>
    </div>`;
}

function renderBoard() {
  const g = view.game;
  const card = g.cards[g.index];
  const revealed = g.phase === 'reveal';
  const upIndex = card.team;
  const picked = g.picked;

  // The sentence. Label cards highlight the target word; word cards show the sentence plain.
  let sentence = esc(card.context);
  if (card.type === 'label') {
    sentence = sentence.replace(esc(card.focus), `<mark class="focus">${esc(card.focus)}</mark>`);
  }

  const choices = card.options.map((text, i) => {
    let state = '';
    if (revealed) {
      if (i === card.correct) state = 'is-correct';
      else if (i === picked) state = 'is-wrong';
    }
    return `<button class="choice ${state}" data-action="pick" data-index="${i}" ${revealed ? 'disabled' : ''}>${esc(text)}</button>`;
  }).join('');

  let result = '';
  if (revealed) {
    const team = g.teams[upIndex];
    if (picked === null) {
      result = `<p class="verdict neutral">No answer. ${esc(team.name)} scores 0. The answer is <strong>${esc(card.options[card.correct])}</strong>.</p>`;
    } else if (picked === card.correct) {
      result = `<p class="verdict good">Correct. ${esc(team.name)} scores ${POINTS_PER_CORRECT} points.</p>`;
    } else {
      result = `<p class="verdict bad">Not quite. The answer is <strong>${esc(card.options[card.correct])}</strong>.</p>`;
    }
  }

  const explain = revealed ? `
    <div class="explain">
      <p class="explain-label">Why</p>
      <p>${esc(card.why)}</p>
      <p class="explain-label">Ask the class</p>
      <p>${esc(card.discuss)}</p>
    </div>` : '';

  const hint = !revealed && view.hint ? `<div class="hint"><strong>Hint:</strong> ${esc(card.hint)}</div>` : '';

  const controls = revealed
    ? `<button class="button primary" data-action="next">${g.index + 1 === g.cards.length ? 'See results' : 'Next card'} &rarr;</button>`
    : `<button class="button outline" data-action="pass">No answer (0 points)</button>
       <button class="button outline" data-action="hint">${view.hint ? 'Hide hint' : 'Show hint'}</button>`;

  const track = CHAMBERS.map((name, i) => `
    <span class="chamber ${i === card.sector ? 'is-current' : ''}">${i + 1}. ${esc(name)}</span>`).join('');

  const progress = Math.round(((g.index + (revealed ? 1 : 0)) / g.cards.length) * 100);

  return `
    <section class="board" aria-label="Game board">
      <div class="scoreboard">
        ${teamCard(g.teams[0], upIndex === 0)}
        <div class="vs">vs</div>
        ${teamCard(g.teams[1], upIndex === 1)}
      </div>

      <div class="card play">
        <div class="play-top">
          <div class="chips">
            <span class="chip">${esc(CHAMBERS[card.sector])}</span>
            <span class="chip muted">${esc(countText(g))}</span>
          </div>
          <div class="turn"><span>${esc(g.teams[upIndex].name)}</span> is up</div>
        </div>
        <div class="progress" aria-hidden="true"><span style="width:${progress}%"></span></div>
        <div class="chambers">${track}</div>

        <h1 class="prompt" tabindex="-1" data-focus>${esc(card.prompt)}</h1>
        <p class="sentence">${sentence}</p>
        <div class="aids">
          <button class="textlink" data-action="read">Read aloud</button>
        </div>
        ${hint}

        <div class="choices">${choices}</div>
        ${result}
        ${explain}

        <div class="controls">${controls}</div>
        <p class="leave"><button class="textlink" data-action="leave">Leave this game</button></p>
      </div>
    </section>`;
}

function renderFinish() {
  const g = view.game;
  const [a, b] = g.teams;
  const win = winner(g);
  const headline = win ? `${esc(win.name)} wins!` : "It's a tie!";
  const missed = debrief(g);
  const note = missed
    ? `<p class="debrief"><strong>Teacher debrief:</strong> Most cards were missed on <strong>${esc(capitalize(missed.skill))}</strong> (${missed.missed} of ${missed.total} cards). Start the next lesson there.</p>`
    : '<p class="debrief"><strong>Teacher debrief:</strong> Every card was answered correctly. Try a longer game next time.</p>';
  return `
    <section class="card finish">
      <p class="eyebrow">Mission complete</p>
      <h1 tabindex="-1" data-focus>${headline}</h1>
      <div class="final-scores">
        ${[a, b].map(t => `
          <div class="final-team ${win && win.name === t.name ? 'is-win' : ''}">
            <span class="team-name">${esc(t.name)}</span>
            <strong>${t.score}</strong><small>points</small>
          </div>`).join('')}
      </div>
      ${note}
      <div class="actions">
        <button class="button primary" data-action="setup">Play again</button>
        <button class="button outline" data-action="home">Home</button>
      </div>
    </section>`;
}

// ---- Rendering and events --------------------------------------------------

function render() {
  const screens = { home: renderHome, how: renderHow, setup: renderSetup, board: renderBoard, finish: renderFinish };
  app.innerHTML = (screens[view.screen] || renderHome)();
  const focusTarget = app.querySelector('[data-focus]');
  if (focusTarget && view.screen !== 'board') focusTarget.focus({ preventScroll: false });
  save();
}

function parseMembers(text) {
  return text.split('\n').map(line => line.trim()).filter(Boolean).slice(0, 30);
}

function startGame(form) {
  const data = new FormData(form);
  const setup = {
    teamA: String(data.get('teamA') || '').trim(),
    membersA: String(data.get('membersA') || ''),
    teamB: String(data.get('teamB') || '').trim(),
    membersB: String(data.get('membersB') || ''),
    count: Number(data.get('count')) || 16,
  };
  view.setup = setup;
  if (!setup.teamA || !setup.teamB) {
    view.error = 'Give both teams a name.';
    return render();
  }
  if (setup.teamA.toLowerCase() === setup.teamB.toLowerCase()) {
    view.error = 'The two teams need different names.';
    return render();
  }
  view.error = '';
  const seed = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  view.game = buildGame({
    count: setup.count,
    seed,
    teamNames: [setup.teamA, setup.teamB],
    members: [parseMembers(setup.membersA), parseMembers(setup.membersB)],
  });
  view.hint = false;
  view.screen = 'board';
  announce(`Game started. ${setup.teamA} is up first.`);
  render();
}

app.addEventListener('submit', event => {
  if (event.target.id !== 'setup-form') return;
  event.preventDefault();
  startGame(event.target);
});

app.addEventListener('click', event => {
  const el = event.target.closest('[data-action]');
  if (!el) return;
  const action = el.dataset.action;
  const g = view.game;

  if (action === 'flip') {
    setFlipped(el, el.getAttribute('aria-pressed') !== 'true');
    return;
  }
  if (action === 'flip-all' || action === 'flip-none') {
    app.querySelectorAll('.flashcard').forEach(card => setFlipped(card, action === 'flip-all'));
    return;
  }

  if (action === 'home' || action === 'how' || action === 'setup') {
    view.screen = action;
    view.error = '';
    return render();
  }

  if (action === 'pick' || action === 'pass') {
    if (!g || g.phase !== 'board') return;
    const choice = action === 'pass' ? null : Number(el.dataset.index);
    const correct = answer(g, choice);
    const card = g.cards[g.index];
    const team = g.teams[card.team];
    announce(choice === null
      ? `No answer. ${team.name} scores 0.`
      : correct ? `Correct. ${team.name} scores ${POINTS_PER_CORRECT} points.`
        : `Not quite. The answer is ${card.options[card.correct]}.`);
    return render();
  }

  if (action === 'hint') {
    view.hint = !view.hint;
    return render();
  }

  if (action === 'read') {
    if (!g) return;
    const card = g.cards[g.index];
    readAloud(`${card.context} ${card.prompt} ${card.options.join(', ')}`);
    return;
  }

  if (action === 'next') {
    if (!g || g.phase !== 'reveal') return;
    nextCard(g);
    view.hint = false;
    view.screen = g.phase === 'finish' ? 'finish' : 'board';
    if (view.screen === 'finish') announce(`${winner(g)?.name ?? 'Tie'} ${winner(g) ? 'wins' : 'is a tie'}.`);
    return render();
  }

  if (action === 'leave') {
    if (!window.confirm('Leave this game? The scores will be lost.')) return;
    view.game = null;
    view.hint = false;
    view.screen = 'home';
    return render();
  }
});

restore();
render();
