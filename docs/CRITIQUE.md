# Word Vault: critique and changes

This document has three parts: a programmer's critique, an educator's critique, and a review of both. Each item ends with a status: **Done**, **Partly**, or **Later** (with the reason).

Evidence came from reading the code, running the game end to end in a headless browser with five student tabs and one host, and running the 19 existing tests.

---

## Part 1: Programmer's critique (round 1)

### What is good
- Answers are checked on the server, and the answer key never reaches the browser during play.
- Scoring runs in a locked SQL transaction, so two simultaneous answers cannot double-score.
- The design is cohesive and reads well on phones once the layout is right.
- The question data is consistent: every card has four distinct options, an explanation, and a discussion prompt.

### Issues

**P1. The countdown trusts each device's clock.** A device 31 seconds fast showed `0s` and disabled all four answers from the first second of a card. *Status: **Done**. The timer now uses server time from each poll.*

**P2. Every poll rebuilt the page.** The app re-rendered every 6 seconds, which reset keyboard focus to the page body. Confirmed in the browser. *Status: **Done**. It now re-renders only when the state changes, and it restores focus after a render.*

**P3. Answer positions were skewed.** The correct answer was in slot B for 13 of 32 cards and in slot A for only 3. Always tapping B was a winning strategy. *Status: **Done**. Options are shuffled per room and per card, with a test that checks the spread.*

**P4. Team totals favored the bigger team.** Teams differ by one player, so totals tilt the result. *Status: **Done**. Teams are compared by average points per player.*

**P5. Tied players showed the wrong rank.** Four players tied at 15 were shown as 1, 2, 3, 4 and only one was named "top score." *Status: **Done**. Ties share a rank, and every tied name is shown.*

**P6. Session storage is per browser, not per tab.** Two tabs on the same site share one saved session, so reloading a tab can load the other player's session. Confirmed in testing. *Status: **Partly**. The static demo uses per-tab storage. The real build still uses browser storage, because a student who closes the tab would otherwise lose their place. A teacher should use one tab for the host screen.*

**P7. The server code could not run anywhere except Vercel.** The game logic was tied to Node and Supabase, so there was no way to test or play it locally. *Status: **Done**. The rules now live in `server/engine.js`, which uses only standard web APIs. Vercel and a local mock use thin adapters around it.*

**P8. The GitHub Pages link could not work.** The build used absolute asset paths (`/assets/...`), but a project page lives at `/nouns/`, so the scripts and styles 404 and the page stays blank. Pages also cannot run `/api/game`. *Status: **Done** for the first part (the build now takes a base path, and a workflow builds a static demo). The demo is single-browser by design; see the review.*

**P9. Scoring rules exist twice.** The rules are in SQL and mirrored in the in-memory test database. They can drift apart. *Status: **Later**. The clean fix is to run `supabase/schema.sql` in a real Postgres engine (PGlite) inside the test suite. That needs its own setup, so it belongs with the Vercel step.*

**P10. Only one question set, always in the same order.** The quick game is always the same 16 cards. *Status: **Done** (see E1).*

**P11. Unused data.** Every card has a `hint` field, but students never see it. *Status: **Done** (see E3).*

**P12. Missing project files.** The README listed `.gitignore` and `.env.example`, but neither existed. *Status: **Done**.*

**P13. Question data is hard to edit safely.** Teachers edit JavaScript objects, and a missing comma breaks the whole game. *Status: **Partly**. A test now checks every question's shape and that every focus word appears in its sentence. Moving the bank to JSON or a spreadsheet is **Later**.*

**P14. The stylesheet is one minified line.** Hard to review or change. *Status: **Later**. It is cosmetic, and reformatting it now would bury the real changes in a huge diff.*

**P15. No automated test of the browser interface.** The browser playthrough was a manual script. *Status: **Later**. It is worth adding to CI once the Vercel deployment exists, since it needs real network calls.*

**P16. The team-balancing rule is unclear on a tie.** Teams with equal averages are shown as tied, which is fine, but the rule is not stated for the students. *Status: **Done**. The leaderboard footnote now explains it.*

---

## Part 2: Educator's critique (round 1)

Assumptions: the audience is a classroom of students learning grammar, most likely upper elementary or middle school. The teacher sets the pace, and speed matters less than understanding. Please tell me the grade level so I can tune the reading load.

### What is good
- Real sentences, not isolated words, make the questions more meaningful.
- The explanations say *why* the answer is right in plain language.
- Team mode and the group leaderboard keep the room engaged.
- The end-of-game "concepts to review" list is a useful teaching signal.

### Issues

**E1. Too little variety, and all of it is recognition.** All 32 original cards are multiple choice that asks students to label something. Six of the first 16 cards start with the same words, "What kind of pronoun is highlighted?" Students who memorize the pattern can play without thinking. *Status: **Done** in part. There are now 64 cards, a random balanced mix for each game, and new formats (fill in the blank, find the error, choose the correct form, and sentence-level identification). Production tasks, such as writing or rewriting a sentence, are **Later** because this format cannot grade free text.*

**E2. Major grammar topics are missing.** The game does not teach the most common errors kids make: subject and object pronouns (I or me, who or whom), its versus it's, your versus you're, irregular plurals (children, knives), count and non-count nouns, and pronoun reference. *Status: **Done**. Each of these now has at least one card, and the common errors (its, your, "Me and Sam") have error-correction cards.*

**E3. Students never see the hints.** Each card has a hint in the data, but nothing shows it. Hints are the most useful thing a struggling student can get. *Status: **Done**. A "Need a hint?" button shows the hint with no point penalty.*

**E4. The speed bonus rewards guessing.** Ten extra points for answering within 10 seconds encourages students to skim. In a grammar lesson, that is the wrong habit. *Status: **Later**. A teacher setting to turn the bonus off needs a new database column, so it belongs in the Vercel and Supabase step. My recommendation is to make the bonus optional and off by default for practice.*

**E5. Explanations only justify the correct answer.** Students often learn more from why the other choices are wrong. *Status: **Later**. Writing a short reason for each wrong option is about 200 lines of content, and it should be reviewed by a teacher before it goes in.*

**E6. Some wording is confusing.** For example, card 32's discussion prompt ("Why is 'our' not a replacement in 'They are ___'?") is muddled. *Status: **Done** for card 32. I did not change the other original cards, since they are the teacher's original work, except to fix clear errors.*

**E7. Reading load is high for young readers, and the timer is short.** Thirty seconds is enough for an adult, but a student who decodes each word may run out. *Status: **Partly**. There is now a "Read aloud" button for the question and options. It uses the browser's built-in voice, so quality varies by device, and it does not replace teacher support.*

**E8. The teacher debrief is generic.** It says the same thing after every game. *Status: **Done**. It now names the concept most students missed in that game.*

**E9. Terms are unexplained.** "Interrogative," "demonstrative," and "intensive" are terms many students will not know. *Status: **Later**. The explanations use plain words, but a glossary and simpler labels should be a teacher decision.*

**E10. Privacy and retention.** The README tells teachers to ask students to use nicknames, which is good, but there is no automatic cleanup. *Status: **Partly**. The README now includes a cleanup query. Automatic deletion is **Later**.*

---

## Part 3: Review of this document

I reread Parts 1 and 2 looking for errors and gaps.

**Corrections to my earlier claims**
- I said students could see the answers in the browser. That is true only if the repository is public, because the question bank is in `server/questions.js`. On Vercel with the keys configured, the answers stay on the server during play. The README now says this clearly.
- I said the Pages 404 was caused by a missing base path. That is my best diagnosis from the code and from the static HTML I could fetch. I have not seen the live site run a game, so I will confirm it after the deploy.

**What I missed the first time**
- A static Pages demo cannot do real multiplayer. Each browser has its own storage, so the demo can only simulate a room across tabs in one browser. The site should say so, which the new build does.
- The question bank is public on any static host, so the demo bundle includes the answer key. That is acceptable for a practice site, but it means the demo is not for graded use.
- The accessibility work is thin. I have not checked screen-reader behavior with a real screen reader, and that needs a manual test.

**Priorities, after review**
1. Get a working GitHub Pages demo (P8). This is the test you asked for.
2. Variety and hints (E1, E2, E3), since they change how the game feels most.
3. The shared engine (P7), because it lets the demo and tests run the same rules.
4. Everything marked **Later**, which waits for the Vercel and Supabase step.

**Limits of this review**
- I could not test with real students, so the reading-level and timer advice is an informed guess.
- Speech quality depends on the device.
- Real Supabase behavior is not tested here. The engine and the fake database mirror the SQL, but only a real deployment can confirm them.

---

## Implementation status

| Item | Status |
| --- | --- |
| P1 to P4, P5, P10 | Done (previous commit, plus seeded room selection) |
| P6 per-tab sessions | Partly (demo only) |
| P7 shared engine | Done |
| P8 Pages base path and demo build | Done in code, deploy pending |
| P9 SQL in real Postgres | Later |
| P11, E3 hints | Done |
| P12 gitignore and env example | Done |
| P13 question validation | Partly |
| P14 CSS formatting | Later |
| P15 browser tests in CI | Later |
| E1 variety | Done in part (64 cards, new formats) |
| E2 missing topics | Done |
| E4 optional speed bonus | Later (needs a database column) |
| E5 wrong-answer reasons | Later (needs teacher review) |
| E6 card 32 wording | Done |
| E7 read aloud | Partly |
| E8 debrief | Done |
| E9 glossary | Later |
| E10 retention | Partly |
