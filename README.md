# The Word Vault — Multiplayer Grammar Game

**Deployable classroom game (requires Supabase setup):** 32 original questions on eight noun types and eight pronoun types; live room codes, teacher-paced rounds, student answers on individual devices, leaderboards, team mode, and missed-concept report.

Built with **Vite (website)** + **Vercel Functions (server-verified answers)** + **Supabase Postgres/Realt​ime (shared game state)**. No student accounts needed.

## Do not host this on GitHub Pages

GitHub Pages only serves static files. This game also needs the `/api/game` server function, and that only runs on Vercel (step 3 below). If you enable Pages for this repo you will see a 404, or a page that loads but can never start a game. Deploy on Vercel instead; GitHub is only where the code lives.

## Try it locally in 10 seconds (no accounts needed)

```bash
npm install
npm run dev:mock
```

Open the address it prints. Rooms live in memory (an in-memory stand-in for Supabase in `dev/fake-db.js`) and disappear when you stop it. Open the page in several browser windows to act as the teacher and students.

## Deploy to GitHub + Vercel (about 4 setup steps)

1. **Create Supabase project:** at https://supabase.com/dashboard. Go to **SQL Editor** → New Query, paste all of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This creates the room/player/answer tables, scoring functions and a Realtime event feed.
2. **Create GitHub repository:** at https://github.com/new. Upload the **contents of this folder** (not the ZIP file) to the repository. Alternatively in Terminal, from this directory:
   ```bash
   git init
   git add .
   git commit -m "Launch Word Vault multiplayer"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/word-vault-multiplayer.git
   git push -u origin main
   ```
3. **Import to Vercel:** https://vercel.com/new → Import Git Repository → select your repo. Framework: **Vite** (usually detected). Build command `npm run build`, output `dist`.
4. **Add three environment variables** in Vercel project Settings → Environment Variables. Obtain from your Supabase project's **Connect** / **API Keys** settings:

   | Variable | Value | Safe to expose? |
   | --- | --- | --- |
   | `SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` | Public URL |
   | `SUPABASE_SECRET_KEY` | Supabase **secret** (`sb_secret_...`) key, or legacy `service_role` key | **NO — server only** |
   | `SUPABASE_PUBLISHABLE_KEY` | Supabase **publishable** (`sb_publishable_...`) key, or legacy `anon` key | Yes (read-only notifications) |

   Redeploy after adding these variables if it already deployed. **Never paste the secret key in GitHub, `.env.example`, or any browser JS file.**

Then open your Vercel site, choose **Host a classroom**, share its six-character code or invite link, and let students join. Click **Start challenge**, **Reveal answer**, and **Next card** to run the game.

### How it plays

- Teacher chooses 16 or 32 questions, 20/30/45/60 seconds per card, and individual vs. balanced team scoring.
- Students join by room code and nickname, no account needed.
- Everyone sees the *same question at the same time*. Students may submit one answer per question.
- **10 points** for a correct answer, **+5** additional points if it was submitted within the first 10 seconds. Incorrect/unanswered = 0. Scores update after teacher reveals the answer.
- Answer choices are shuffled for each room, so the right answer is not always in the same slot.
- Team mode compares **average points per player**, so a team with one extra student has no advantage.
- The final screen shows each student their rank and how many cards they got right, names every player tied for first, and announces the winning team.
- The teacher controls reveal and next card (or may end the game early). Once revealed, everyone sees the answer explanation and vote distribution.
- The teacher can use the end-of-game weak-concepts report for discussion.

**Important:** The older single-screen Word Vault game used steals, teacher-awarded explanation points and three-answer streaks. These are deliberately *not* carried into online multiplayer; every student now answers independently under the same timer. The original 32 questions and explanations are preserved.

### What to commit

```
word-vault-multiplayer/
├── index.html                 # HTML entry
├── src/
│   ├── main.js                # host/student UI, live subscriptions
│   ├── scoring.js             # ranks, ties, team averages (unit tested)
│   └── styles.css             # responsive visual design
├── api/game.js                # Vercel serverless API (secure checking)
├── server/
│   ├── questions.js           # original answer key (SERVER ONLY)
│   ├── game-logic.js          # answer shuffling
│   └── db.js                  # Supabase connection (swappable for tests)
├── supabase/schema.sql        # paste once in SQL Editor
├── dev/                       # local mock: fake-db.js, mock-server.mjs
├── tests/                     # npm test
├── .env.example               # placeholders only
├── .gitignore
├── package.json
├── vercel.json
└── README.md
```

### Local development

Requirements: Node.js 20.19+; Vercel CLI if testing the full API locally.

```bash
npm install
npm test
npm run build
npm install -g vercel
cp .env.example .env
# Edit .env with your own keys (never commit it)
vercel dev
```

`npm run dev:mock` is the quickest way to play locally (see above). The plain `npm run dev` command starts **the frontend only**, not the `/api/game` route. Use `vercel dev` to test against your real Supabase project, or deploy on Vercel.

## Data, privacy and limits

- Player nickname, answers, points, and room metadata are saved to your Supabase database. **Ask students to use first names/nicknames, not personal details.** The current schema doesn't automatically delete these; delete old rooms/records in Supabase to comply with your classroom's policies.
- Sessions are stored **only in each browser's localStorage**, so reloading works. Opening another browser is a new player unless the student rejoins before the teacher starts. The teacher's host token is also device-local; keep the host tab/device.
- The server validates student tokens and scores answers transactionally; the game API does not send answer keys before the reveal. **For a classroom, consider keeping the GitHub repository private** so students cannot inspect the server-side question bank in the source repository.
- Supabase Realtime pushes harmless change notifications, while HTTP handles all protected game data. Fallback polling refreshes every 6 seconds if Realtime drops.
- Classroom prototype: 60 player cap, not load-tested at scale. It does not include production abuse protection, CAPTCHA, host recovery, or managed retention. Use appropriate rate limiting before public/high-traffic use.
- A new room requires a new code; there is no replay button yet.
- **A public GitHub repository exposes the answer key.** Anyone can open `server/questions.js`. For real classroom use, set the repository to **Private** (Settings > General > Danger Zone); Vercel can still deploy private repositories.
- To delete old rooms, players and answers, run this in the Supabase SQL Editor (it cascades): `delete from public.vault_rooms where created_at < now() - interval '30 days';`

**Troubleshooting:**
- “Server not configured” → check `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in Vercel; redeploy.
- “Request could not be completed” → check you ran the entire SQL script and confirm the key permissions in Supabase.
- Students stuck on the previous screen → check `SUPABASE_PUBLISHABLE_KEY` and Realtime publication (`vault_events`), or allow up to 6 seconds for fallback polling.
- A `404` on `github.io`, or "The game server was not found": the site is on GitHub Pages, which cannot run the API. Deploy on Vercel instead.
- `404` at `/api/game` → confirm the Vercel import uses the repository root as the project root and hasn't been deployed as a static-only file upload.

### Verification status

`npm test` runs the question-bank checks, unit tests for the shuffle and scoring helpers, and API tests that play full games (join, answer, reveal, early finish, late and duplicate answers) against the in-memory database. The interface was also played end to end in a headless browser with five phone-sized student windows plus a host. A live Supabase/Vercel deployment has **not** been tested here, and `supabase/schema.sql` is mirrored by `dev/fake-db.js` rather than run, so test one teacher and two student devices after adding your own Supabase keys.
