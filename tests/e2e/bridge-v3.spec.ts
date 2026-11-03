import {test,expect} from '@playwright/test';
test('BridgeCall lab stays labeled, requires consent and routes to the other inbox',async({page})=>{
 await page.goto('/bridge-call');await expect(page.getByText(/Local simulation · no phone calls/)).toBeVisible();
 await page.getByRole('button',{name:'Start simulated session'}).click();
 await expect(page.getByRole('button',{name:'Connect simulated participants'})).toBeDisabled();
 await page.getByLabel('Participant A consents in this simulation').check();await page.getByLabel('Participant B consents in this simulation').check();
 await page.getByRole('button',{name:'Connect simulated participants'}).click();await page.getByRole('button',{name:'Route only to the other participant'}).click();
 await expect(page.locator('.participant-inboxes section').nth(0)).not.toContainText('From A:');await expect(page.locator('.participant-inboxes section').nth(1)).toContainText('From A:');
 await page.getByRole('button',{name:'End simulated session'}).click();await expect(page.getByRole('status')).toContainText('ended');
});
for(const width of [440,1440])test(`BridgeCall no horizontal overflow at ${width}`,async({page})=>{await page.setViewportSize({width,height:956});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/bridge-call');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);});
