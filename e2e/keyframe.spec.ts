import { expect, test } from "./fixtures";
import { openPopup } from "./pages/popup";

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
  expect(await popup.getTimelineValue()).toBeCloseTo(0.4, 1);
  await expect(popup.getRotationSlider()).toHaveValue("90");
  await expect(popup.getRemoveRotationKeyframeButton()).toBeVisible();
  await expect(popup.getAddRotationKeyframeButton()).not.toBeVisible();

  await popup.getNextKeyframeButton().click();
  expect(await popup.getTimelineValue()).toBeCloseTo(0.8, 1);
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

  expect(await popup.getTimelineValue()).toBeCloseTo(0.3, 1);
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
