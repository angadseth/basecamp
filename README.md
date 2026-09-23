# Basecamp

A field guide to the **eight Foundation-level courses** of the IIT Madras BS in Data Science and
Applications — one hub and eight subject pages, each subject with its own theme.

**Live at [angadseth.github.io/basecamp](https://angadseth.github.io/basecamp/)** · Made by Angad Jangir.

| # | Course | Code | Page |
|---|---|---|---|
| 1 | Mathematics for Data Science 1 | BSMA1001 | [`maths1/`](maths1/) |
| 2 | English 1 | BSHS1001 | [`english1/`](english1/) |
| 3 | Computational Thinking | BSCS1001 | [`ct/`](ct/) |
| 4 | Statistics for Data Science 1 | BSMA1002 | [`stats1/`](stats1/) |
| 5 | Mathematics for Data Science 2 | BSMA1003 | [`maths2/`](maths2/) |
| 6 | English 2 | BSHS1002 | [`english2/`](english2/) |
| 7 | Programming in Python | BSCS1002 | [`python/`](python/) |
| 8 | Statistics for Data Science 2 | BSMA1004 | [`stats2/`](stats2/) |

Every page follows the same seven chapters — what the course actually asks, the week-by-week map, an
interactive widget built from that course's own content, how it is graded, where marks are lost, the
resources worth opening, and what to do in week one.

## What this site is not

There are **no graded-assignment or quiz solutions here**, and no links to sites that post them. Where a
page gives an opinion it says so, and [`docs/sources.html`](docs/sources.html) lists where every other
fact came from.

**The September 2026 grading document was not published when this was written (23 September 2026).**
Every formula on the site is from the May 2026 document and the site says so on every page. Check your
course page in week 1 and trust it over this.

## Running it

No build step. Plain HTML, CSS and JavaScript.

```sh
python -m http.server 8788 --bind 127.0.0.1
```

## Checking it

```sh
cd tests && npm install
node check.mjs                                  # structure, widgets, themes, mobile
node check.mjs http://127.0.0.1:8788 --links     # and open every external link
node shot.mjs "maths1/" dark 1366                # full-page screenshot
node fig.mjs "maths1/" "#quad .widget" quad      # one element
```

`check.mjs` must print `ALL PASSED` before any change is considered done.

## Layout

```
index.html              the hub: the eight, the rules, the Sep 2026 dates
<slug>/index.html       one page per course
docs/sources.html       where every fact came from
assets/site/            tokens · layout · components · hub · subject   (shared, no colours in subject.css)
assets/subjects/*.css   one file per course: its palette, fonts and motif
assets/js/              site.js and calc.js are shared; the rest are per-course widgets
tests/                  checks and screenshot tools
```

The split matters: `assets/site/` owns the scale, rhythm and shell so eight very different-looking pages
still behave identically, and `assets/subjects/<slug>.css` owns everything that makes them look different.
