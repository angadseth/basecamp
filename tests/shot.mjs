// Screenshot a page, full height: node shot.mjs <path> <light|dark> <width>
// e.g. node shot.mjs / dark 1366   ·   node shot.mjs maths1/ light 390
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [path = "/", scheme = "light", width = "1366", base = "http://127.0.0.1:8788"] =
  process.argv.slice(2);
const w = parseInt(width, 10);

mkdirSync("shots", { recursive: true });

const b = await chromium.launch();
const c = await b.newContext({
  viewport: { width: w, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: scheme,
  reducedMotion: "reduce",
  isMobile: w < 500,
  hasTouch: w < 500
});
const p = await c.newPage();
const url = base + "/" + path.replace(/^\//, "");
const res = await p.goto(url, { waitUntil: "networkidle" });
if (!res || !res.ok()) {
  console.error("FAILED", res && res.status(), url);
  await b.close();
  process.exit(1);
}
await p.waitForTimeout(400);

const name = (path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home");
const file = `shots/${name}-${scheme}-${w}.png`;
await p.screenshot({ path: file, fullPage: true });

const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));
console.log("saved", file, errs.length ? "WITH ERRORS: " + errs.join("; ") : "");
await b.close();
