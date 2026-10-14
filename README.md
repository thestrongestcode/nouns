# The Word Vault — Multiplayer Grammar Game

**Deployable classroom game (requires Supabase setup):** 32 original questions on eight noun types and eight pronoun types; live room codes, teacher-paced rounds, student answers on individual devices, leaderboards, team mode, and missed-concept report.

Built with **Vite (website)** + **Vercel Functions (server-verified answers)** + **Supabase Postgres/Realt​ime (shared game state)**. No student accounts needed.

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
- The teacher controls reveal and next card (or may end the game early). Once revealed, everyone sees the answer explanation and vote distribution.
- The teacher can use the end-of-game weak-concepts report for discussion.

**Important:** The older single-screen Word Vault game used steals, teacher-awarded explanation points and three-answer streaks. These are deliberately *not* carried into online multiplayer; every student now answers independently under the same timer. The original 32 questions and explanations are preserved.

### What to commit

```
word-vault-multiplayer/
├── index.html                 # HTML entry
├── src/
│   ├── main.js                # host/student UI, live subscriptions
│   └── styles.css             # responsive visual design
├── api/game.js                # Vercel serverless API (secure checking)
├── server/questions.js        # original answer key (SERVER ONLY)
├── supabase/schema.sql        # paste once in SQL Editor
├── tests/quiz.test.mjs
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

The plain `npm run dev` command starts **the frontend only**, not the `/api/game` route. Use `vercel dev` for a fully playable local version or deploy on Vercel.

## Data, privacy and limits

- Player nickname, answers, points, and room metadata are saved to your Supabase database. **Ask students to use first names/nicknames, not personal details.** The current schema doesn't automatically delete these; delete old rooms/records in Supabase to comply with your classroom's policies.
- Sessions are stored **only in each browser's localStorage**, so reloading works. Opening another browser is a new player unless the student rejoins before the teacher starts. The teacher's host token is also device-local; keep the host tab/device.
- The server validates student tokens and scores answers transactionally; the game API does not send answer keys before the reveal. **For a classroom, consider keeping the GitHub repository private** so students cannot inspect the server-side question bank in the source repository.
- Supabase Realtime pushes harmless change notifications, while HTTP handles all protected game data. Fallback polling refreshes every 6 seconds if Realtime drops.
- Classroom prototype: 60 player cap, not load-tested at scale. It does not include production abuse protection, CAPTCHA, host recovery, or managed retention. Use appropriate rate limiting before public/high-traffic use.
- A new room requires a new code; there is no replay button yet.

**Troubleshooting:**
- “Server not configured” → check `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in Vercel; redeploy.
- “Request could not be completed” → check you ran the entire SQL script and confirm the key permissions in Supabase.
- Students stuck on the previous screen → check `SUPABASE_PUBLISHABLE_KEY` and Realtime publication (`vault_events`), or allow up to 6 seconds for fallback polling.
- `404` at `/api/game` → confirm the Vercel import uses the repository root as the project root and hasn't been deployed as a static-only file upload.

### Verification status

The question-bank unit tests and JavaScript syntax checks passed. A live Supabase/Vercel deployment and production build were **not** executed in this environment; you should test one teacher and two student devices after adding your own Supabase keys.
