// Basecamp checks.
//   node check.mjs                          → local, http://127.0.0.1:8788
//   node check.mjs https://…/basecamp/      → a deployed copy
//   node check.mjs <base> --links           → also open every external link
//
// Prints ALL PASSED or a list of failures, and exits non-zero on failure.

import { chromium } from "playwright";

const args = process.argv.slice(2);
const base = (args.find((a) => !a.startsWith("--")) || "http://127.0.0.1:8788").replace(/\/$/, "");
const checkLinks = args.includes("--links");

const SUBJECTS = [
  { path: "maths1/", code: "BSMA1001", widget: "#m1-quad", chapters: 7 },
  { path: "english1/", code: "BSHS1001", widget: "#e1-tenses", chapters: 7 },
  { path: "ct/", code: "BSCS1001", widget: "#ct-code", chapters: 7 },
  { path: "stats1/", code: "BSMA1002", widget: "#s1-stats", chapters: 7 },
  { path: "maths2/", code: "BSMA1003", widget: "#m2-stage", chapters: 7 },
  { path: "english2/", code: "BSHS1002", widget: "#e2-tabs", chapters: 7 },
  { path: "python/", code: "BSCS1002", widget: "#py-verdicts", chapters: 7 },
  { path: "stats2/", code: "BSMA1004", widget: "#s2-plot", chapters: 7 }
];

const fails = [];
const seenLinks = new Set();

function fail(where, msg) {
  fails.push(`${where}: ${msg}`);
}

const browser = await chromium.launch();

async function open(path, scheme = "light", width = 1366) {
  const ctx = await browser.newContext({
    viewport: { width, height: 900 },
    colorScheme: scheme,
    reducedMotion: "reduce",
    isMobile: width < 500,
    hasTouch: width < 500
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  const res = await page.goto(`${base}/${path}`, { waitUntil: "networkidle" });
  return { ctx, page, errors, res };
}

// ---- The hub ---------------------------------------------------------------

{
  const { ctx, page, errors, res } = await open("");
  const where = "hub";
  if (!res || !res.ok()) fail(where, `HTTP ${res && res.status()}`);

  const cards = await page.locator(".scard").count();
  if (cards !== 8) fail(where, `expected 8 subject cards, found ${cards}`);

  const stops = await page.locator(".route__stop").count();
  if (stops !== 8) fail(where, `expected 8 route stops, found ${stops}`);

  // Every card and route stop must point at a page that exists.
  const hrefs = await page.locator(".scard").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  const want = SUBJECTS.map((s) => s.path);
  for (const w of want) if (!hrefs.includes(w)) fail(where, `no card links to ${w}`);

  // The contour hero must actually draw.
  const paths = await page.locator("#contours path").count();
  if (paths < 20) fail(where, `contour field drew only ${paths} paths`);

  // The calculator must compute, and react to a change.
  const first = await page.locator("#calc-score").textContent();
  if (!/^\d/.test((first || "").trim())) fail(where, `calculator shows "${first}"`);
  await page.locator("#calc-f").fill("100");
  await page.locator("#calc-f").dispatchEvent("input");
  const after = await page.locator("#calc-score").textContent();
  if (after === first) fail(where, "calculator did not react to the end-term slider");

  // Python's formula must be reachable from the picker.
  await page.locator("#calc-course").selectOption("py");
  const pe = await page.locator("#calc-pe1").count();
  if (!pe) fail(where, "Python mode does not show an OPPE input");

  // The term ticket must mark exactly one row as next (or none, if all passed).
  const nextRows = await page.locator(".ticket__row--next").count();
  if (nextRows > 1) fail(where, `${nextRows} rows marked as next on the ticket`);

  if (errors.length) fail(where, `console: ${errors.join(" | ")}`);
  await ctx.close();
}

// ---- The eight subject pages ----------------------------------------------

for (const s of SUBJECTS) {
  for (const scheme of ["light", "dark"]) {
    const { ctx, page, errors, res } = await open(s.path, scheme);
    const where = `${s.path} (${scheme})`;

    if (!res || !res.ok()) { fail(where, `HTTP ${res && res.status()}`); await ctx.close(); continue; }

    const code = await page.locator(".shero__code").textContent();
    if (!code || !code.includes(s.code)) fail(where, `hero does not name ${s.code}`);

    const chapters = await page.locator(".chapter").count();
    if (chapters !== s.chapters) fail(where, `expected ${s.chapters} chapters, found ${chapters}`);

    const toc = await page.locator(".toc a").count();
    if (toc !== s.chapters) fail(where, `index has ${toc} entries for ${chapters} chapters`);

    // Every chapter index entry must point at a section that exists.
    const bad = await page.evaluate(() =>
      [...document.querySelectorAll(".toc a")]
        .map((a) => a.getAttribute("href"))
        .filter((h) => h && h.startsWith("#") && !document.querySelector(h))
    );
    if (bad.length) fail(where, `index points at missing sections: ${bad.join(", ")}`);

    // The widget must have rendered something.
    const w = page.locator(s.widget);
    if (!(await w.count())) fail(where, `widget ${s.widget} is missing`);
    else {
      const box = await w.boundingBox();
      if (!box || box.height < 20) fail(where, `widget ${s.widget} rendered ${box ? box.height : 0}px tall`);
    }

    // Each page must carry its own theme file, so it cannot silently fall back
    // to the hub's look.
    const slug = s.path.replace("/", "");
    const themed = await page.evaluate(
      (sl) => [...document.styleSheets].some((ss) => (ss.href || "").includes(`/subjects/${sl}.css`)),
      slug
    );
    if (!themed) fail(where, `assets/subjects/${slug}.css is not loaded`);

    // Credit, exactly as Angad asked.
    const foot = await page.locator(".foot").textContent();
    if (!foot.includes("Made by Angad Jangir")) fail(where, "footer credit missing");

    if (errors.length) fail(where, `console: ${errors.join(" | ")}`);

    if (checkLinks && scheme === "light") {
      const links = await page.evaluate(() =>
        [...document.querySelectorAll('a[href^="http"]')].map((a) => a.href)
      );
      for (const l of links) seenLinks.add(l);
    }

    await ctx.close();
  }
}

// ---- Sources page ----------------------------------------------------------

{
  const { ctx, page, errors, res } = await open("docs/sources.html");
  if (!res || !res.ok()) fail("docs/sources.html", `HTTP ${res && res.status()}`);
  // Collapse whitespace: the sentence wraps across lines in the source.
  const text = (await page.locator("main").textContent()).replace(/\s+/g, " ");
  if (!text.includes("September 2026 grading document had not been published")) {
    fail("docs/sources.html", "the grading-document caveat is missing");
  }
  if (errors.length) fail("docs/sources.html", `console: ${errors.join(" | ")}`);
  if (checkLinks) {
    const links = await page.evaluate(() =>
      [...document.querySelectorAll('a[href^="http"]')].map((a) => a.href)
    );
    for (const l of links) seenLinks.add(l);
  }
  await ctx.close();
}

// ---- Mobile smoke test -----------------------------------------------------

for (const path of ["", "maths1/", "python/"]) {
  const { ctx, page, errors } = await open(path, "light", 390);
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  if (overflow > 2) fail(`${path || "hub"} (390px)`, `page scrolls sideways by ${overflow}px`);
  if (errors.length) fail(`${path || "hub"} (390px)`, `console: ${errors.join(" | ")}`);
  await ctx.close();
}

// ---- External links --------------------------------------------------------

if (checkLinks) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const list = [...seenLinks].sort();
  console.log(`checking ${list.length} external links…`);
  for (const url of list) {
    try {
      const r = await page.request.get(url, { timeout: 30000, maxRedirects: 5 });
      // 403 from a bot-blocking host is not a dead link; anything 4xx/5xx else is.
      if (r.status() >= 400 && r.status() !== 403 && r.status() !== 429) {
        fail("link", `${r.status()} ${url}`);
      }
    } catch (e) {
      fail("link", `${String(e).split("\n")[0]} ${url}`);
    }
  }
}

await browser.close();

if (fails.length) {
  console.log(`\n${fails.length} FAILED:`);
  for (const f of fails) console.log("  ✗ " + f);
  process.exit(1);
}
console.log("ALL PASSED");
