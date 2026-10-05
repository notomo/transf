import { DEFAULT_ANIMATION } from "../src/feature/animation-state";
import { expect, test } from "./fixtures";
import { openTestPage, sendAnimationStateToContent } from "./pages/content";

test("content script does not affect page layout", async ({
  page,
  serviceWorker,
}) => {
  const url = "https://transf.test/";
  await openTestPage({ page, url });

  await sendAnimationStateToContent({
    serviceWorker,
    url,
    animationState: DEFAULT_ANIMATION,
  });
  await expect(page.locator("head #transf-animation-styles")).toBeAttached();
  await expect(page.locator("#transf-gizmo")).toBeAttached();

  const { childCount, scrollHeight, innerHeight } = await page.evaluate(() => ({
    childCount: document.body.children.length,
    scrollHeight: document.documentElement.scrollHeight,
    innerHeight: window.innerHeight,
  }));
  expect(childCount).toBe(1);
  expect(scrollHeight).toBe(innerHeight);
});
