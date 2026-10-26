# The Word Vault: classroom board game

A nouns and pronouns game for one screen, written for 11th and 12th grade students in Seminars in Topics of Literature at Brewster Madrid. The class is split into two teams, and the teams take turns. Each card shows a sentence, and the teams decide the answer together. The teacher runs the game on one device that is shared on the board. Students do not need devices or accounts.

The game runs entirely in the browser. There is no server, database, or join code.

## Run it locally

```bash
npm install
npm run dev
```

Open the address it prints.

## Publish on GitHub Pages

The workflow in `.github/workflows/pages.yml` builds the game and publishes it on every push to `main`.

1. In the repository, go to **Settings > Pages**.
2. Under **Build and deployment > Source**, choose **GitHub Actions**.
3. Merge to `main`. The site appears at `https://USERNAME.github.io/REPO/`.

## How it plays

- **Set up:** name each team, list its members (one per line), and choose 16 cards (quick) or 32 cards (full).
- **Turns:** Team 1 gets the first card, Team 2 the second, and so on. Each team gets both kinds of card equally.
- **Two kinds of card:**
  - **Label card:** one word is highlighted. The question is "This highlighted word is...", and the answers are full labels such as "a common noun."
  - **Word card:** no word is highlighted. The question is "Which word in this sentence is a...?", and the answers are words from the sentence.
- **Answer:** the team talks it over, then the teacher taps the team's answer. "No answer" scores 0.
- **Score:** 10 points for a correct answer. Teams are compared by total points.
- **Discuss:** after each card the board shows why the answer is right and a question for the class.
- **Finish:** the winner is shown, with the concept most cards were missed on.
- **Help:** "Show hint" gives a clue, "Read aloud" reads the sentence and the choices, and "How to play" explains the rules on screen.
- **Flashcards:** the home page has a flip card for each of the 14 noun and pronoun types the game uses. The back shows what it means, examples, a sentence, and a tip for spotting it. "Flip all" reveals every card at once.

The game is saved in the browser tab, so a page refresh keeps the current game. "Leave this game" ends it.

## Files

| Path | What it is |
| --- | --- |
| `src/questions.js` | The 128 cards: 64 label cards and 64 word cards, 32 per chamber |
| `src/flashcards.js` | The 16 study flashcards on the home page |
| `src/game.js` | Card selection, team turns, scoring, and the debrief (no browser code) |
| `src/main.js` | The screens: home, how to play, setup, board, and results |
| `src/styles.css` | Styling, sized for a projected board |
| `tests/bank.test.mjs` | Checks every card: one correct answer, words really in the sentence, no em dashes |
| `tests/game.test.mjs` | Checks card selection, team alternation, and scoring |
| `tests/flashcards.test.mjs` | Checks there is a flashcard for every type the game asks about |

## Test

```bash
npm test
```

## The cards

- **Noun Forge:** kinds of noun: common, proper, concrete, abstract, collective, and possessive.
- **Pronoun Portal:** kinds of pronoun: personal, possessive, reflexive, intensive, demonstrative, indefinite, relative, and interrogative.
- **Repair Lab:** look-alikes, where the same word does different jobs ("that" as a relative or demonstrative pronoun, reflexive vs. intensive, "between you and me").
- **Master Lock:** famous lines from Shakespeare, Austen, Dickens, Fitzgerald, Wilde, Shelley, Melville, and Keats.

Each game draws 16 or 32 cards at random from the pool of 128, so back-to-back quick games share only about 2 cards on average. About half the sentences are real lines from public-domain works, and the board shows the source under each. Discussion questions tie the grammar back to the text.

## Notes for editing questions

- Every label card's answer must match its `skill`, and its highlighted word must appear in the sentence.
- Every word card's options must be whole words that appear in its sentence, and only one of them can fit the category.
- Keep each chamber at 8 label cards and 8 word cards. The tests check this.

## History

The earlier version had phone play with join codes, a Supabase database, and a Vercel API. It was retired when the game moved to one shared board. It is still in the git history before commit `23f80cc`.
