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

  await popup.getDurationSlider().fill("5000");
  await expect(page.getByText("Duration: 5000ms")).toBeVisible();
});

test("can change duration", async ({ page, extensionId }) => {
  const popup = await openPopup({ page, extensionId });

  await popup.getDurationSlider().fill("3000");
  await expect(page.getByText("Duration: 3000ms")).toBeVisible();
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

  await popup.setTimelineValue(0.4);
  await popup.getRotationSlider().fill("90");

  await popup.setTimelineValue(0.8);
  await popup.getRotationSlider().fill("135");

  await popup.getPrevKeyframeButton().click();
  const timeline = popup.getTimelineSlider();
  const prevValue = await timeline.getAttribute("aria-valuenow");
  expect(Number(prevValue)).toBeCloseTo(0.4, 1);
  await expect(popup.getRotationSlider()).toHaveValue("90");
  await expect(popup.getRemoveRotationKeyframeButton()).toBeVisible();
  await expect(popup.getAddRotationKeyframeButton()).not.toBeVisible();

  await popup.getNextKeyframeButton().click();
  const nextValue = await timeline.getAttribute("aria-valuenow");
  expect(Number(nextValue)).toBeCloseTo(0.8, 1);
  await expect(popup.getRotationSlider()).toHaveValue("135");
  await expect(popup.getRemoveRotationKeyframeButton()).toBeVisible();
  await expect(popup.getAddRotationKeyframeButton()).not.toBeVisible();
});

test("can add keyframe by double-clicking KeyframeLine", async ({
  page,
  extensionId,
}) => {
  const popup = await openPopup({ page, extensionId });

  await popup.doubleClickKeyframeTimeline({
    fieldLabel: "Rotation",
    position: 0.3,
  });

  await expect(popup.getKeyframeButton(30)).toBeVisible();
});

test("can jump to keyframe by clicking on it", async ({
  page,
  extensionId,
}) => {
  const popup = await openPopup({ page, extensionId });

  await popup.setTimelineValue(0.3);
  await popup.getRotationSlider().fill("90");
  await popup.getAddRotationKeyframeButton().click();

  await popup.setTimelineValue(0.7);

  await popup.getKeyframeButton(30).click();

  const timeline = popup.getTimelineSlider();
  const value = await timeline.getAttribute("aria-valuenow");
  expect(Number(value)).toBeCloseTo(0.3, 1);
  await expect(popup.getRotationSlider()).toHaveValue("90");
});

test("can move keyframe by dragging", async ({ page, extensionId }) => {
  const popup = await openPopup({ page, extensionId });

  await popup.setTimelineValue(0.3);
  await popup.getRotationSlider().fill("90");
  await popup.getAddRotationKeyframeButton().click();

  await popup.dragKeyframe({
    fieldLabel: "Rotation",
    fromPercentage: 30,
    toValue: 0.6,
  });

  await expect(popup.getKeyframeButton(30)).not.toBeVisible();
  await expect(popup.getKeyframeButton(60)).toBeVisible();
});
