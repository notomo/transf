import path from "node:path";
import { type BrowserContext, test as base, chromium } from "@playwright/test";

const pathToExtension = path.resolve(".output/chrome-mv3");

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  // biome-ignore lint/correctness/noEmptyPattern: playwirght error(First argument must use the object destructuring pattern)
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext("", {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    const page = await context.newPage();
    await page.goto("chrome://extensions/");

    const extensionCard = page.locator("extensions-item").first();
    const extensionId = await extensionCard.getAttribute("id");
    if (!extensionId) {
      throw new Error("no extension id");
    }

    await page.close();
    await use(extensionId);
  },
});
export const expect = test.expect;
