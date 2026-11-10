import { chromium, webkit } from "/Users/jasonkobs/Library/CloudStorage/OneDrive-Personal/Claude-Projects/solunar-fishing-app/node_modules/playwright/index.mjs";
const [app, out] = process.argv.slice(2);
const url = "file://" + app + "/index.html";
const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); console.log((c ? "PASS " : "FAIL ") + m); };

// Icons from the SVG
const b0 = await chromium.launch();
for (const size of [180, 192, 512]) {
  const p = await b0.newPage({ viewport: { width: size, height: size } });
  await p.goto("file://" + app + "/icon.svg");
  await p.screenshot({ path: `${app}/icon-${size}.png` });
  await p.close();
}
await b0.close();

let engine = webkit; try { const t = await webkit.launch(); await t.close(); } catch { engine = chromium; console.log("WebKit not installed, using Chromium"); }
const browser = await engine.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: engine !== webkit ? true : undefined, hasTouch: true });
const page = await ctx.newPage();
const errors = []; page.on("pageerror", e => errors.push(e.message));
page.on("dialog", d => { console.log("dialog:", d.message()); d.accept(); });
await page.goto(url);
await page.screenshot({ path: `${out}/1-setup.png`, fullPage: true });
await page.fill("#name", "Dad"); await page.fill("#w", "135"); await page.fill("#r", "8");
ok((await page.textContent("#est")).includes("171"), "135 x 8 estimates a max of 171");
await page.click("#start");
const t = await page.textContent("#app");
ok(t.includes("Week 1") && t.includes("Heavy"), "Today opens on week 1 heavy day");
ok(t.includes("135 lb × 5"), "Week 1 heavy is 135 × 5");
ok(t.includes("45 per side"), "Plate math shows 45 per side for 135");
ok(t.includes("45 × 10") && t.includes("70 × 5") && t.includes("95 × 3"), "Warm-ups are 45, 70, 95");
await page.click('[data-set="0"]');
ok(await page.isVisible("#timer") && (await page.textContent("#timerText")).includes("Rest 3:00") || (await page.textContent("#timerText")).includes("Rest 2:5"), "Rest timer starts at 3:00 on heavy day");
await page.screenshot({ path: `${out}/2-today.png`, fullPage: true });
await page.click("#finish");
ok((await page.textContent("#app")).includes("Volume") && (await page.textContent("#app")).includes("115 lb × 8"), "Next session is volume 4 × 8 @ 115");
// Program grid values
await page.click('nav button[data-tab="program"]');
const g = await page.textContent("#app");
ok(g.includes("5×4 @ 145") && g.includes("3×3 @ 150") && g.includes("4×6 @ 125"), "Program grid shows 145 / 150 / 125 for weeks 2-3");
await page.screenshot({ path: `${out}/3-program.png`, fullPage: true });
// Week 3 heavy AMRAP
await page.click('.cell[data-w="3"][data-d="1"]');
ok((await page.textContent("#app")).includes("135 lb × max reps"), "Week 3 has a 135 max-reps set");
await page.fill('[data-reps="3"]', "10"); await page.dispatchEvent('[data-reps="3"]', "change");
ok((await page.textContent("#amrapNote")).includes("180"), "135 x 10 estimates 180");
// Max test
await page.click('nav button[data-tab="program"]');
await page.click('.cell[data-w="4"][data-d="3"]');
const tt = await page.textContent("#app");
ok(tt.includes("95 lb × 5") && tt.includes("155 lb × 1") && tt.includes("180 lb × 1") && tt.includes("190 lb × 1"), "Test ladder 95, 155, 180, 190");
await page.screenshot({ path: `${out}/4-test.png`, fullPage: true });
await page.fill("#testMax", "185"); await page.dispatchEvent("#testMax", "change");
await page.click("#finish");
await page.click('nav button[data-tab="program"]');
ok((await page.textContent("#app")).includes("Weeks 5–8") && (await page.textContent("#app")).includes("5×5 @ 145"), "Block 2 rebuilt from 185: week 1 heavy 145");
// Persistence across reload
await page.reload();
await page.click('nav button[data-tab="progress"]');
const pr = await page.textContent("#app");
ok(pr.includes("185") && pr.includes("40 lb to go"), "Data survives reload; 40 lb to go");
await page.screenshot({ path: `${out}/5-progress.png`, fullPage: true });
// No horizontal scroll at phone width
ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "No horizontal scroll at 390 px");
ok(errors.length === 0, "No page errors " + errors.join("; "));
await browser.close();
console.log(fails.length ? `${fails.length} FAILED` : "ALL PASSED");
