import { test, expect } from "@playwright/test";
test("chat, glossary persistence and export", async ({ page }) => {
  await page.goto("/");
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
  await page
    .getByRole("button", { name: "Meaning Mirror", exact: true })
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
    .getByLabel("Response and interface language")
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
  await page.getByLabel("Reading size").selectOption("large");
  await page.reload();
  await expect(page.getByLabel("Reading size")).toHaveValue("large");
  await page.goto("/");
  page.on("dialog", (dialog) => dialog.accept());
  await page
    .getByLabel("Choose a document")
    .setInputFiles("public/examples/school-letter.pdf");
  await expect(page.getByText("school-letter.pdf")).toBeVisible();
});
