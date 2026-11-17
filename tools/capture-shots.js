// Refresh card pictures: npm i playwright-core@1.48.2 && node tools/capture-shots.js <pngdir> [repo ...]
// then: sips -s format jpeg -s formatOptions 72 --resampleWidth 640 <png> --out shots/<repo>.jpg
// Scratch play pages: click the green flag, then capture only the player.
const { chromium } = require('playwright-core');
const out = process.argv[2];
const only = process.argv.slice(3);
const SCRATCH = ['disco-scratch', 'recursive-scratch', 'octostudio-scratch', 'disco-logo'];
const ALL = ['1derworld', 'biofeedback', 'bonkworks', 'disco-logo', 'disco-scratch', 'image-quilter', 'mad-libs-piano',
  'mania-arena', 'morph-lab', 'octostudio-scratch', 'recursive-scratch', 'text-graph-convos', 'tic-tac-mania',
  'Visual-convos', 'wordcloud'];
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true,
    args: ['--use-fake-ui-for-media-stream', '--autoplay-policy=no-user-gesture-required', '--enable-unsafe-swiftshader'] });
  for (const name of (only.length ? only : ALL)) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
    const url = `https://wakeupsilver.github.io/${name}/`;
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 60000 });
      if (SCRATCH.includes(name)) {
        const stage = page.locator('.stage');
        await sleep(9000);                       // TurboWarp loads the .sb3
        const box = await stage.boundingBox();
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);   // green-flag overlay
        await sleep(6000);
        await stage.screenshot({ path: `${out}/${name}.png` });
      } else {
        await sleep(6000);
        await page.screenshot({ path: `${out}/${name}.png` });
      }
      console.log('ok', name);
    } catch (e) { console.log('FAIL', name, e.message.split('\n')[0]); }
    await page.close();
  }
  await browser.close();
})();
