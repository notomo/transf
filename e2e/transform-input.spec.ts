import { expect, test } from "./fixtures";
import { openPopup } from "./pages/popup";

test("UI displays values correctly with labels", async ({
  page,
  extensionId,
}) => {
  const popup = await openPopup({ page, extensionId });

  await popup.getRotationSlider().fill("90");
  await expect(page.getByText("Rotation: 90°")).toBeVisible();

  await popup.getScaleSlider().fill("1.5");
  await expect(page.getByText("Scale: 1.5x")).toBeVisible();

  await popup.getTranslateXSlider().fill("200");
  await expect(page.getByText("Translate X: 200px")).toBeVisible();

  await popup.getTranslateYSlider().fill("-100");
  await expect(page.getByText("Translate Y: -100px")).toBeVisible();

  await popup.getCenterXSlider().fill("30");
  await expect(page.getByText("Center X: 30%")).toBeVisible();

  await popup.getCenterYSlider().fill("70");
  await expect(page.getByText("Center Y: 70%")).toBeVisible();
});

test("can add and remove keyframes", async ({ page, extensionId }) => {
  const popup = await openPopup({ page, extensionId });

  await popup.getAddRotationKeyframeButton().click();
  await popup.getRemoveRotationKeyframeButton().click();
});

test("can navigate between keyframes", async ({ page, extensionId }) => {
  const popup = await openPopup({ page, extensionId });

  await popup.getRotationSlider().fill("45");
  await popup.getAddRotationKeyframeButton().click();

  await popup.getTimelineSlider().fill("0.4");
  await popup.getRotationSlider().fill("90");

  await popup.getTimelineSlider().fill("0.8");
  await popup.getRotationSlider().fill("135");

  await popup.getPrevKeyframeButton().click();
  await expect(popup.getTimelineSlider()).toHaveValue("0.4");
  await expect(popup.getRotationSlider()).toHaveValue("90");
  await expect(popup.getRemoveRotationKeyframeButton()).toBeVisible();
  await expect(popup.getAddRotationKeyframeButton()).not.toBeVisible();

  await popup.getNextKeyframeButton().click();
  await expect(popup.getTimelineSlider()).toHaveValue("0.8");
  await expect(popup.getRotationSlider()).toHaveValue("135");
  await expect(popup.getRemoveRotationKeyframeButton()).toBeVisible();
  await expect(popup.getAddRotationKeyframeButton()).not.toBeVisible();
});
