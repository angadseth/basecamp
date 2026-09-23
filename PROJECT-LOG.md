# Basecamp: project log

What was built, when, and why it was built that way. Newest at the bottom.

## 2026-09-23 — built in one session

**Asked for:** a site for all eight Foundation-level courses, each with its own theme, in the spirit of
Converge (the MLF/MLT/MLP guide) — "online sab jagah se resources dhoondho". Mid-build: keep everything
in one folder and update all memory; and commit often, deliberately, so the contribution graph is green.

**Decided up front** (all three approved before any code): the name **Basecamp**; **a hub plus eight
separately themed pages** rather than one long page; and **full field-guide depth** per subject rather
than a resource index.

### Research, before anything was written
- The eight course pages on `study.iitm.ac.in` — week lists quoted verbatim, instructors, books, requisites.
- The **May 2026 grading document** (full text), which turned out to carry the site's headline:
  **GAA weightage for Foundation is now 0**, with 10 marks of quiz/end-term questions drawn from the
  assignments instead.
- The **Sep 2026 academic calendar image**, read directly rather than trusting a summary. It gave the
  registration window (which closed the day this was built), the term start, and the fact that
  **Quiz 2 falls on a Saturday** this term.
- The eight official YouTube playlists via `yt-dlp` → 951 lectures, ~309 hours.
  *Trap:* the installed yt-dlp (2026.02.21) silently capped every playlist at 100 items and returned a
  different 100 each run. `pip install -U yt-dlp` fixed it.

### Structure
`assets/site/` holds the scale, rhythm, shell and components, and deliberately contains **no colour or
typeface choices** for the subject pages. `assets/subjects/<slug>.css` holds only palette, fonts and
motif. That split is what lets eight pages look nothing alike and behave identically — and it is the
thing to preserve when editing.

### The eight themes
Cartesian graph paper (Maths 1) · letterpress with a red pen (English 1) · blueprint (CT) ·
newsprint data desk (Stats 1) · vector space with a dot lattice (Maths 2) · stage and spotlight
(English 2) · REPL notebook (Python) · quadrille lab book (Stats 2). Each has its own three fonts, its
own accent, and a page-wide background motif.

### One widget per course, all built from that course's own content
- **Maths 1** — a live quadratic: vertex, roots, discriminant (week 3).
- **English 1** — the twelve tenses as three times four, not twelve facts (week 5).
- **CT** — a pseudocode tracer stepping through MaxMin with a live variable table (week 2).
- **Stats 1** — type numbers, get the whole five-number summary, histogram and boxplot, with **both**
  standard deviations shown because which one a question wants is the thing people get wrong (week 3).
- **Maths 2** — a 2×2 matrix moving the plane, with det, rank, nullity and invertibility changing
  together (weeks 1–6).
- **English 2** — the seven clause patterns, labelled element by element (weeks 1–3).
- **Python** — an eligibility checker for all four OPPE/end-term gates, because this course fails people
  on rules rather than on difficulty.
- **Stats 2** — the central limit theorem actually run: 4,000 sample means against the predicted normal.

### Facts the site surfaces that the official pages do not put together
- GAA is 0 for Foundation, but the assignments still gate end-term eligibility.
- **English 1 and 2 have a different eligibility rule** — best 5 of the first 7 weeks, with no Mock Quiz
  in the list, so seven chances instead of eight.
- **Python has no "best of"** for OPPE eligibility: A1–A4 and A5–A8 are each checked at 40 individually.
- Statistics 1 and 2 forfeit their 5 bonus marks entirely if you submit an activity but do fewer than
  five peer reviews.
- Maths 1 turns into a graph-theory course in week 10.
- Maths 2's course page says eleven weeks while the grading document still says "W11/W12" — flagged,
  not resolved.

### Verified
`node tests/check.mjs` → ALL PASSED (structure, chapter indexes, every widget rendering, per-subject
theme actually loaded, footer credit, no console errors, light and dark, and no sideways scroll at
390px). `node tests/check.mjs … --links` → **59 external links, all live**.

### Open
1. No GitHub repo or Pages deploy yet — commits are local only.
2. Replace the May 2026 formulas when the Sep 2026 grading document appears.
3. Grade bands used by the hub calculator are the programme's usual scale, not from the grading
   document; the page says to confirm them.
