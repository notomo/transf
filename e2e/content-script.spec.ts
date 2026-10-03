import type { Browser } from "wxt/browser";
import { DEFAULT_ANIMATION } from "../src/feature/animation-state";
import { expect, test } from "./fixtures";

// Available in the extension service worker where evaluate() runs.
declare const chrome: typeof Browser;

test("content script does not affect page layout", async ({
  page,
  serviceWorker,
}) => {
  const url = "https://transf.test/";
  await page.route(url, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html>
<html>
  <head><style>html, body { margin: 0; } main { height: 100vh; }</style></head>
  <body><main>content</main></body>
</html>`,
    }),
  );
  await page.goto(url);

  // Retry until the content script's message listener is registered.
  await expect(async () => {
    await serviceWorker.evaluate(
      async ({ url, animationState }) => {
        const [tab] = await chrome.tabs.query({ url });
        if (tab?.id === undefined) {
          throw new Error(`tab not found: ${url}`);
        }
        await chrome.tabs.sendMessage(tab.id, { animationState });
      },
      { url, animationState: DEFAULT_ANIMATION },
    );
  }).toPass();
  await expect(page.locator("head #transf-animation-styles")).toBeAttached();

  const { childCount, scrollHeight, innerHeight } = await page.evaluate(() => ({
    childCount: document.body.children.length,
    scrollHeight: document.documentElement.scrollHeight,
    innerHeight: window.innerHeight,
  }));
  expect(childCount).toBe(1);
  expect(scrollHeight).toBe(innerHeight);
});
