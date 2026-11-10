// Progress chart: max step line, goal, outlook and workout-estimate dots.
// Usage: node tools/tests/chart.mjs "$PWD" <shots-dir>
import { chromium } from "/Users/jasonkobs/Library/CloudStorage/OneDrive-Personal/Claude-Projects/solunar-fishing-app/node_modules/playwright/index.mjs";
const [app, out] = process.argv.slice(2), url = "file://" + app + "/index.html";
const fails = []; const ok = (c, m) => { if (!c) fails.push(m); console.log((c ? "PASS " : "FAIL ") + m); };
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const p = await ctx.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message));
const count = sel => p.locator(sel).count();
const progress = () => p.click('nav button[data-tab="progress"]');
const today = () => p.click('nav button[data-tab="today"]');
const saved = () => p.evaluate(() => JSON.parse(localStorage.getItem("bench225-v1")));

await p.goto(url);
await p.fill("#name", "Dad"); await p.fill("#w", "135"); await p.fill("#r", "8"); await p.click("#start");
await progress();
ok(await p.isVisible("#chart"), "Chart shows on Progress right after setup");
ok(await count("#chart .maxpt") === 1 && await count("#chart .est") === 0, "One max point, no estimate dots yet");
ok(await count("#chart .outlook") === 1, "Outlook line drawn");
ok((await p.textContent("#chart")).includes("Goal 225"), "Goal line labeled 225");

// Week 1 heavy as planned (5 × 5 @ 135): saves date and weights, but no dot
await today(); await p.click("#finish");
let s = await saved(), log = s.log.b1w1d1;
ok(log.done && log.at && log.w.length === 5 && log.w[0] === 135, "Finish saves date and the weights used");
await progress();
ok(await count("#chart .est") === 0, "Workout done as planned adds no dot");

// Volume day: 4 × 8 @ 115, but 10 reps on the first set: 115 × 10 = 153
await today();
await p.fill('[data-reps="0"]', "10"); await p.dispatchEvent('[data-reps="0"]', "change");
await p.click("#finish");
await progress();
ok(await count("#chart .est") === 1, "Beating the planned reps adds a dot");
ok((await p.textContent("#chart .est title")) === "153 lb estimate", "Dot is the Epley estimate: 115 × 10 = 153");

// Weights stay as logged after the max changes
await p.fill("#newMax", "200"); await p.click("#saveMax");
s = await saved();
ok(s.log.b1w1d1.w[0] === 135, "Saved weights don't change when the max changes");
ok(await count("#chart .maxpt") === 2 && (await p.getAttribute("#chart .maxline", "d")).includes("V"), "Manual max change adds a step");
await p.screenshot({ path: `${out}/chart.png`, fullPage: true });

// Old saves without dates still render
await p.evaluate(() => localStorage.setItem("bench225-v1", JSON.stringify({ name: "Son", max: 150, goal: 225, weeks: 4, block: 1, startMax: 150,
  log: { b1w1d1: { sets: {}, acc: {}, done: true } }, history: [{ block: 1, max: 150, date: new Date().toISOString(), source: "x" }] })));
await p.reload(); await progress();
ok(await p.isVisible("#chart") && await count("#chart .est") === 0, "Old save without dates renders the chart");

ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "No horizontal scroll");
ok(!errs.length, "No page errors " + errs.join("; "));
await b.close();
console.log(fails.length ? `${fails.length} FAILED` : "ALL PASSED"); process.exit(fails.length ? 1 : 0);
