import {test,expect} from '@playwright/test';
import {apiResult} from '../helpers/api-result';
import {chatRequestSchema} from '../../src/lib/chat/schema';
test('intro skips and stays skipped on reload',async({page})=>{
 await page.goto('/');await page.keyboard.press('Escape');await expect(page.locator('.intro')).toHaveCount(0);
 await page.reload();await expect(page.locator('.intro')).toHaveCount(0);
});
for(const theme of ['light','dark'])test(`responsive ${theme} and joined RTL`,async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect(page.locator('.intro')).toHaveCount(0);
 await page.getByLabel('Theme',{exact:true}).selectOption(theme);await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`evidence/combined-${info.project.name}-${theme}.png`,fullPage:true});
 for(const lang of ['ps','fa-AF']){await page.getByLabel('Interface language').selectOption(lang);await expect(page.locator('html')).toHaveAttribute('dir','rtl');await expect(page.locator('.plain-greeting h1')).toHaveAttribute('dir','rtl');}
});
for(const chip of ['Translate something','Help me understand'])test(`${chip} sends a complete prompt`,async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('**/api/chat',async route=>{const request=chatRequestSchema.parse(route.request().postDataJSON());await route.fulfill({contentType:'text/event-stream',body:'data: '+JSON.stringify({type:'result',result:apiResult(request)})+'\n\n'});});
 await page.goto('/');const request=page.waitForRequest('**/api/chat');await page.getByRole('button',{name:chip,exact:true}).click();
 expect((await request).postDataJSON().message.length).toBeGreaterThan(70);await expect(page.locator('.chat-message.assistant')).toBeVisible();
});
test('document suggestion opens the upload flow',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');const chooser=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Upload a document',exact:true}).click();expect((await chooser).isMultiple()).toBe(false);
});
