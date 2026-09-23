# Basecamp: project rules

A field guide for the **eight Foundation-level courses** of the IIT Madras BS in Data Science and
Applications. One hub, eight subject pages, **each subject with its own theme**. Live at
https://angadseth.github.io/basecamp/ (repo `angadseth/basecamp`, public, Pages from `main` root).

Read `memory/MEMORY.md` first (local only, gitignored), then `PROJECT-LOG.md`. Add to both as you work.
Raw research lives in `research/` (local only).

## Rules Angad set (2026-09-23)

1. **One site, all 8 Foundation subjects**, in the spirit of Converge and the TDS Field Guide — everything
   worth reading, "online sab jagah se resources dhoondho": official lectures, course-team notes, books,
   YouTube, community.
2. **Every subject gets its own theme.** Not a palette swap — its own materials, motif and hero. The shell
   (nav, chapter rhythm, footer) stays the same so it reads as one site.
3. **Credit: "Made by Angad Jangir" only.** No co-maker.
4. **Many small, real commits.** One logical change per commit, pushed as you go. Never backdate or fake.
5. **Approach, not answers.** No graded-assignment or quiz solutions, and no links to repos that post them.
6. **Every fact needs a source** (see `docs/sources.md`). Unverifiable: attribute it or leave it out.
   Open every link before adding it.
7. **Site language: simple English, friendly senior.** Chat with Angad stays in Hinglish.

## The eight subjects and their themes

| Path | Course | Code | Theme |
|---|---|---|---|
| `maths1/` | Mathematics for Data Science I | BSMA1001 | Cartesian plane — graph paper, plotted curves |
| `stats1/` | Statistics for Data Science I | BSMA1002 | Data desk — newsprint, histogram furniture |
| `ct/` | Computational Thinking | BSCS1001 | Blueprint — flowchart boxes, diamonds, arrows |
| `english1/` | English I | BSHS1001 | Letterpress — serif, marginalia, red pen |
| `maths2/` | Mathematics for Data Science II | BSMA1003 | Vector space — grid transformations |
| `stats2/` | Statistics for Data Science II | BSMA1004 | Lab notebook — bell curves, ridgelines |
| `python/` | Programming in Python | BSCS1002 | REPL — cells, mono, syntax colour |
| `english2/` | English II | BSHS1002 | Stage — big type, transcript columns |

## Stack

Plain HTML/CSS/JS, no build step.

- `index.html` — the hub: what Foundation is, the eight cards, order to take them, the term ticket, calculators.
- `assets/site/` — `tokens.css` (shared scale + neutrals), `layout.css`, `components.css`, `widgets.css`.
- `assets/subjects/<slug>.css` — that subject's theme: its own palette, fonts, motif, hero.
- `assets/js/` — shared: `site.js` (chrome, theme toggle), `calc.js` (score calculators), `calendar.js`.
  Per-subject hero scripts live next to their page.
- `tests/check.mjs` — structure + behaviour across viewports and themes; `--links` checks every external link.

## Verify before saying done

`node tests/check.mjs` (local) and against the live URL must print ALL PASSED, and look at the
`node tests/pages.mjs` screenshots for every subject in both themes.
