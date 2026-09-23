// Screenshot one element: node fig.mjs <path> "<selector>" <name> [light|dark] [width]
// e.g. node fig.mjs maths1/ "#quad .widget" quad dark 1000
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const [path = "", sel = "body", name = "fig", scheme = "light", width = "1200",
       base = "http://127.0.0.1:8788"] = process.argv.slice(2);
const w = parseInt(width, 10);

mkdirSync("shots", { recursive: true });

const b = await chromium.launch();
const c = await b.newContext({
  viewport: { width: w, height: 900 },
  colorScheme: scheme,
  reducedMotion: "reduce",
  deviceScaleFactor: 2
});
const p = await c.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));
p.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });

await p.goto(base + "/" + path.replace(/^\//, ""), { waitUntil: "networkidle" });
await p.waitForTimeout(500);

const el = p.locator(sel).first();
if (!(await el.count())) { console.error("no match for", sel); await b.close(); process.exit(1); }
await el.scrollIntoViewIfNeeded();
await p.waitForTimeout(400);

const file = `shots/${name}-${scheme}.png`;
await el.screenshot({ path: file });
console.log("saved", file, errs.length ? "ERRORS: " + errs.join(" | ") : "(no console errors)");
await b.close();
