import { test, expect } from "@playwright/test";
import { apiResult } from "../helpers/api-result";
import { chatRequestSchema } from "../../src/lib/chat/schema";
// Browser suite uses mocked API transport; never serves sample answers in the application.
test.beforeEach(async ({page}) => {
  await page.route("**/api/chat", async route => {
    const input=chatRequestSchema.parse(route.request().postDataJSON());
    await route.fulfill({status:200,contentType:"text/event-stream",body:"data: "+JSON.stringify({type:"result",result:apiResult(input)})+"\n\n"});
  });
});
test("chat, glossary persistence and export", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Escape");
  await page.locator(".intro").waitFor({state:"detached"});
  await page
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("What does dosage mean?");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await page.getByText("Useful terminology").click();
  await page.getByRole("button", { name: "Save dosage", exact: true }).click();
  await page.goto("/glossary");
  await page.getByLabel("Search terminology").fill("dosage");
  await expect(
    page.getByRole("heading", { name: "dosage", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "dosage", exact: true }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON", exact: true }).click();
  expect((await download).suggestedFilename()).toBe(
    "bridgevoice-glossary.json",
  );
});
test("Meaning Mirror detects changed number and negation", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Escape");
  await page.locator(".intro").waitFor({state:"detached"});
  await page.getByText("Conversation tools",{exact:true}).click();
  await page
    .getByRole("button", { name: "Meaning Mirror", exact: true }).last()
    .click();
  await page
    .getByLabel("Original text", { exact: true })
    .fill("Do not take 2 tablets.");
  await page.getByLabel("Proposed translation").fill("Take 3 tablets.");
  await page.getByRole("button", { name: "Compare meaning" }).click();
  await expect(
    page.getByText(
      "Possible missing or added negation. Human verification required.",
    ),
  ).toBeVisible();
  await page
    .getByLabel("Review negation-mismatch", { exact: true })
    .selectOption("reviewed");
  await page
    .getByLabel("Review negation-mismatch", { exact: true })
    .selectOption("resolved");
});
test("fictional demo, RTL and mobile width", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: "Next demo segment" }).click();
  await expect(page.getByText("1 / 3")).toBeVisible();
  await page
    .getByLabel("Interface language")
    .selectOption("fa-AF");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("settings and document extraction", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("button",{name:"Appearance",exact:true}).click();
  await page.getByLabel("Reading size").selectOption("large");
  await page.reload();
  await page.getByRole("button",{name:"Appearance",exact:true}).click();
  await expect(page.getByLabel("Reading size")).toHaveValue("large");
  await page.goto("/");
  await page.keyboard.press("Escape");
  await page.locator(".intro").waitFor({state:"detached"});
  page.on("dialog", (dialog) => dialog.accept());
  await page
    .getByLabel("Choose a document or photo")
    .setInputFiles("public/examples/school-letter.pdf");
  await expect(page.getByText("school-letter.pdf")).toBeVisible();
});
