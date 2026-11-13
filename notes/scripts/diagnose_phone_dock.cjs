const { spawn } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { chromium } = require('@playwright/test');

async function main() {
  const server = spawn('python3', ['-c', readFileSync('tests/serve.py','utf8').replace('8765','8768')], { stdio: 'ignore' });
  let browser;
  try {
    const url = 'http://127.0.0.1:8768';
    for (let i = 0; i < 100; i++) { try { if ((await fetch(url)).ok) break; } catch {} await new Promise(r => setTimeout(r, 100)); }
    browser = await chromium.launch({ args: ['--no-sandbox'] });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const page = await context.newPage();
    const touch = await context.newCDPSession(page);
    const swipe = async (start,end) => {
      await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:start.x,y:start.y,id:1,radiusX:8,radiusY:8,force:1}]});
      for(let i=1;i<=10;i++) await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*i/10,y:start.y+(end.y-start.y)*i/10,id:1,radiusX:8,radiusY:8,force:1}]});
      await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    };
    await page.goto(url); await page.waitForFunction(() => window.robotlinkcollection?.length); await page.evaluate(() => App.localRobots.pendingSave);
    await page.locator('#tab-joints').tap();
    const slider=page.getByRole('slider',{name:'torso_joint',exact:true});
    let box=await slider.boundingBox();
    await swipe({x:box.x+box.width*.25,y:box.y+box.height/2},{x:box.x+box.width*.8,y:box.y+box.height/2});
    await page.locator('#joints-detach').tap();
    await page.locator('#floating-joints').waitFor({state:'visible'});
    process.stdout.write('urdfVisible='+await page.locator('#panel-urdf').isVisible()+'\n');
    box=await slider.boundingBox();
    await swipe({x:box.x+box.width*.8,y:box.y+box.height/2},{x:box.x+box.width*.2,y:box.y+box.height/2});
    const content=await page.locator('#floating-joints-content').boundingBox();
    await swipe({x:content.x+18,y:content.y+content.height-24},{x:content.x+18,y:content.y+35});
    await page.waitForFunction(()=>document.getElementById('floating-joints-content').scrollTop>20);
    for (const [width,height] of [[667,375],[844,390]]) {
      await page.setViewportSize({width,height});
      await page.waitForFunction(()=>{const box=document.getElementById('floating-joints').getBoundingClientRect();return box.height<=innerHeight*.45+1 && box.bottom<=innerHeight-7 && box.top>=59 && box.left>=7 && box.right<=innerWidth-7;});
    }
    const snapshot = async label => {
      const result = await page.evaluate(() => {
        const ids = ['tab-joints','panel-joints','joint-controls','floating-joints','joints-dock'];
        return Object.fromEntries(ids.map(id => { const e = document.getElementById(id), r = e.getBoundingClientRect(), s = getComputedStyle(e); return [id, {rect:{x:r.x,y:r.y,w:r.width,h:r.height}, hidden:e.hidden, display:s.display, visibility:s.visibility, parent:e.parentElement?.id, ariaSelected:e.getAttribute('aria-selected')}]; }));
      });
      process.stdout.write(JSON.stringify({label,result})+'\n');
    };
    await snapshot('before');
    await page.locator('#joints-dock').tap();
    process.stdout.write('immediateVisible='+await page.locator('#panel-joints #joint-controls').isVisible()+'\n');
    await snapshot('after');
    process.stdout.write('isVisible='+await page.locator('#panel-joints #joint-controls').isVisible()+'\n');
    await page.screenshot({ path: 'notes/artifacts/phone_dock_after.png', fullPage: true });
    await context.close();
  } finally { await browser?.close(); server.kill(); }
}
main().catch(e => { process.stderr.write(e.stack+'\n'); process.exitCode=1; });
