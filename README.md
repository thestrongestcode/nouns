# The Word Vault: Multiplayer Grammar Game

A live classroom game about nouns and pronouns. The teacher opens a room, students join from their own devices with a six-character code, and everyone answers the same card at the same time.

**64 puzzles** (the original 32 plus 32 new ones), in four chambers:
- **Noun Forge:** noun types and plurals
- **Pronoun Portal:** pronoun types and cases
- **Repair Lab:** common errors (its/it's, your/you're, plural and possessive spelling)
- **Master Lock:** mixed, applied grammar

Each game draws a different balanced mix of cards from the bank: four per chamber for a quick game of 16, eight per chamber for a full game of 32.

## Two versions

| Version | Where it runs | Multiple devices? | Use it for |
| --- | --- | --- | --- |
| **Practice demo** | GitHub Pages (static site) | No. Tabs in one browser share a room. | Trying the game, checking the design, rehearsing |
| **Classroom game** | Vercel (with a Supabase database) | Yes | Real classes |

The demo is a test build. It runs the same game rules in the browser, so it has no server and no database. The classroom game needs the Vercel setup below.

## Try the game on your computer (no accounts)

```bash
npm install
npm run dev:mock
```

Open the address it prints. Rooms live in memory and disappear when you stop the server. Open several tabs to act as the teacher and students.

To build the GitHub Pages demo the same way it is built for the site:

```bash
VITE_BASE=/nouns/ npm run build:demo
```

Then serve the `dist-demo` folder under a `/nouns/` path to test it.

## Put the practice demo on GitHub Pages

The workflow at `.github/workflows/pages-demo.yml` builds and publishes the demo on every push to `main` or `improve-word-vault`. Turn it on once:

1. In the repository, go to **Settings > Pages**.
2. Under **Build and deployment > Source**, choose **GitHub Actions**.
3. Push a change (or run the workflow from the **Actions** tab). The site appears at `https://USERNAME.github.io/REPO/`.

GitHub Pages can only serve static files, so the demo cannot run `/api/game`. That is why it is a single-browser practice build.

## Deploy the classroom game to Vercel

1. **Create a Supabase project:** at https://supabase.com/dashboard, open **SQL Editor** > New Query, paste all of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This creates the tables, scoring functions, and the event feed.
2. **Import the repository in Vercel:** at https://vercel.com/new, choose **Import Git Repository** and select this repo. Vercel detects Vite and uses `npm run build` and the `dist` folder.
3. **Add three environment variables** in Vercel under **Settings > Environment Variables**. Copy the values from Supabase's **Connect** or **API Keys** page. [`.env.example`](.env.example) lists the names.

   | Variable | Value | Safe to expose? |
   | --- | --- | --- |
   | `SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` | Public URL |
   | `SUPABASE_SECRET_KEY` | Supabase **secret** key (`sb_secret_...`) or legacy `service_role` key | **NO. Server only.** |
   | `SUPABASE_PUBLISHABLE_KEY` | Supabase **publishable** key (`sb_publishable_...`) or legacy `anon` key | Yes (read-only notifications) |

   Redeploy after adding them. Never put the secret key in GitHub, `.env.example`, or browser code.

Then open your Vercel site, choose **Host a classroom**, share the six-character code or invite link, and let students join. Click **Start challenge**, **Reveal answer**, and **Next card** to run the game.

## How it plays

- The teacher chooses 16 or 32 questions, 20 to 60 seconds per card, and individual or team scoring.
- Students join with the room code and a nickname. No accounts.
- Everyone sees the same question at the same time, and each student answers once.
- **10 points** for a correct answer, plus **5** more if it is submitted within the first 10 seconds. Wrong or missed answers score 0. Scores update when the teacher reveals the answer.
- **Need a hint?** shows the hint for the current card. Hints never cost points.
- **Read aloud** speaks the question and options with the browser's built-in voice. Voice quality depends on the device.
- Answer positions are shuffled for every room and card, so the right answer is not always in the same slot.
- Team mode compares **average points per player**, so the team with one more student does not win automatically.
- Ties share a rank, and the final screen shows each student's own rank and how many cards they got right.
- The teacher's debrief names the concept most students missed in that game.

The original 32 questions and their explanations are unchanged, except that card 32's discussion prompt was clarified. Cards 33 to 64 are new. Question data lives in [`server/questions.js`](server/questions.js), and [`tests/quiz.test.mjs`](tests/quiz.test.mjs) checks every card.

## Files

```
word-vault-multiplayer/
├── index.html                  # HTML entry
├── vite.config.js              # base path and demo switch
├── src/
│   ├── main.js                 # host and student UI, live updates
│   ├── demo-api.js             # practice demo backend (demo build only)
│   ├── scoring.js              # ranks, ties, team averages
│   └── styles.css              # responsive visual design
├── api/game.js                 # Vercel function: HTTP only
├── server/
│   ├── engine.js               # the game API, shared by Vercel, the mock, and the demo
│   ├── game-logic.js           # shuffling and card selection (pure, tested)
│   ├── questions.js            # the question bank (SERVER ONLY on Vercel)
│   ├── memory-db.js            # in-memory stand-in for Supabase (tests, mock, demo)
│   └── db.js                   # Supabase connection (Vercel only)
├── supabase/schema.sql         # paste once in the SQL Editor
├── dev/mock-server.mjs         # local play with no accounts
├── docs/CRITIQUE.md            # programmer and educator critique, with status
├── .github/workflows/pages-demo.yml
├── tests/                      # npm test
├── .env.example
├── .gitignore
├── package.json
├── vercel.json
└── README.md
```

## Data, privacy and limits

- Nicknames, answers, points, and room details are saved to your Supabase database. **Ask students to use first names or nicknames only.** Delete old rooms when your school's policy requires it. This query removes rooms older than 30 days and everything in them:
  ```sql
  delete from public.vault_rooms where created_at < now() - interval '30 days';
  ```
- **The answer key is public if the repository is public.** `server/questions.js` contains every answer. For a real class, make the repository **private** (Settings > General > Danger Zone). Vercel can still deploy a private repository. The practice demo always contains the answer key, because it runs in the browser.
- Sessions are stored in each browser's localStorage, so reloading works. A second browser is a new player. The teacher's host token is also stored on that device, so keep the host tab on one device.
- The server checks every answer and scores it in a locked transaction. Students never receive the answer or the explanation before the reveal.
- Supabase Realtime sends harmless change notices. Protected game data always goes through the HTTP API, and the app polls every 6 seconds as a backup.
- This is a classroom prototype. It supports 60 players per room, has not been load-tested, and has no CAPTCHA, host recovery, or managed retention. Add rate limiting before any public or high-traffic use.
- A new room needs a new code. There is no replay button yet.

**Troubleshooting**
- **"Server not configured":** check `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in Vercel, then redeploy.
- **"Request could not be completed":** run the whole SQL file again and check the key permissions.
- **Students stuck on the previous screen:** check `SUPABASE_PUBLISHABLE_KEY` and the Realtime publication (`vault_events`). Students can also wait up to 6 seconds for the polling backup.
- **"The game server was not found":** the site was opened somewhere that cannot run `/api/game`, such as GitHub Pages. Use the practice demo there, or deploy the classroom game on Vercel.
- **404 at `/api/game` on Vercel:** confirm the project root is the repository root and that the project was imported from Git, not uploaded as static files.

## Verification status

`npm test` runs 27 checks: the question bank (shape, variety, highlighted words that really appear in their sentences, no duplicate cards), the shuffle and card selection, the scoring and team rules, and full games played through the engine. The static demo was also played end to end in a headless browser with five student tabs and a host, with no page errors.

**Not tested here:** a live Supabase and Vercel deployment. The engine and the in-memory database mirror `supabase/schema.sql` but do not run it. Before a real class, play one host screen and two student devices.
