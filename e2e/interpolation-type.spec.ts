import { expect, test } from "./fixtures";
import { openPopup } from "./pages/popup";

test("can change interpolationType of a keyframe", async ({
  page,
  extensionId,
}) => {
  const popup = await openPopup({ page, extensionId });

  // Add a keyframe at 30%
  await popup.setTimelineValue(0.3);
  await popup.getAddRotationKeyframeButton().click();
  await popup.getRotationSlider().fill("90");

  // The interpolationType selector should be visible at currentTime
  const selector = page.locator("select").first();
  await expect(selector).toBeVisible();

  // Change interpolationType to ease-in
  await selector.selectOption("ease-in");

  // Verify the value changed
  await expect(selector).toHaveValue("ease-in");

  // Move to a different time and back to verify persistence
  await popup.setTimelineValue(0.5);
  await popup.setTimelineValue(0.3);

  // The interpolationType should still be ease-in
  const selectorAfter = page.locator("select").first();
  await expect(selectorAfter).toBeVisible();
  await expect(selectorAfter).toHaveValue("ease-in");
});

test("can click interpolationType selector", async ({ page, extensionId }) => {
  const popup = await openPopup({ page, extensionId });

  // Add a keyframe at 30%
  await popup.setTimelineValue(0.3);
  await popup.getAddRotationKeyframeButton().click();
  await popup.getRotationSlider().fill("90");

  // The interpolationType selector should be visible at currentTime
  const selector = page.locator("select").first();
  await expect(selector).toBeVisible();

  // Try to click the selector
  await selector.click();

  // The selector should be focused
  await expect(selector).toBeFocused();
});

test("interpolationType selector appears only for current keyframe", async ({
  page,
  extensionId,
}) => {
  const popup = await openPopup({ page, extensionId });

  // Add keyframes at different times
  await popup.setTimelineValue(0.3);
  await popup.getAddRotationKeyframeButton().click();

  await popup.setTimelineValue(0.7);
  await popup.getAddScaleKeyframeButton().click();

  // At 0.7, only one selector should be visible (for Scale at 0.7)
  const selectors = page.locator("select");
  await expect(selectors).toHaveCount(1);

  // Move to 0.3, selector should appear for Rotation
  await popup.setTimelineValue(0.3);
  await expect(selectors).toHaveCount(1);
});
