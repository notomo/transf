import { test } from "./fixtures";
import { openPopup } from "./pages/popup";

const isScreenshotMode = process.env["SCREENSHOT"] === "true";

test("take popup screenshot", async ({ page, extensionId }) => {
  if (!isScreenshotMode) {
    test.skip();
  }

  const popup = await openPopup({ page, extensionId });

  await popup.getCenterXSlider().fill("75");

  await page.screenshot({ path: "e2e/screenshots/popup-default.png" });
});
