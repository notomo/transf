import path from "node:path";
import {
  type BrowserContext,
  test as base,
  chromium,
  type Worker,
} from "@playwright/test";

const pathToExtension = process.env["CI"]
  ? path.resolve(".output/chrome-mv3")
  : path.resolve(".output/chrome-mv3-dev");

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
  serviceWorker: Worker;
}>({
  // biome-ignore lint/correctness/noEmptyPattern: playwirght error(First argument must use the object destructuring pattern)
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext("", {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        "--window-position=3520,0",
        "--window-size=1920,1080",
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
  serviceWorker: async ({ context }, use) => {
    const serviceWorker =
      context.serviceWorkers()[0] ??
      (await context.waitForEvent("serviceworker"));
    await use(serviceWorker);
  },
});
export const expect = test.expect;
