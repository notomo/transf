import { expect, test } from "./fixtures";
import { openPopup } from "./pages/popup";

test("Reset button resets all transform values to defaults", async ({
  page,
  extensionId,
}) => {
  const popup = await openPopup({ page, extensionId });

  await popup.getCenterXSlider().fill("75");
  await popup.getCenterYSlider().fill("25");
  await popup.getRotationSlider().fill("45");
  await popup.getScaleSlider().fill("2");
  await popup.getTranslateXSlider().fill("100");
  await popup.getTranslateYSlider().fill("-200");

  await popup.getHorizontalFlipCheckbox().check();
  await popup.getVerticalFlipCheckbox().check();

  await popup.getAddCenterXKeyframeButton().click();
  await popup.getAddRotationKeyframeButton().click();
  await popup.getAddScaleKeyframeButton().click();

  await popup.clickReset();

  await expect(popup.getCenterXSlider()).toHaveValue("50");
  await expect(popup.getCenterYSlider()).toHaveValue("50");
  await expect(popup.getRotationSlider()).toHaveValue("0");
  await expect(popup.getScaleSlider()).toHaveValue("1");
  await expect(popup.getTranslateXSlider()).toHaveValue("0");
  await expect(popup.getTranslateYSlider()).toHaveValue("0");
  await expect(popup.getDurationSlider()).toHaveValue("5000");
  await expect(popup.getHorizontalFlipCheckbox()).not.toBeChecked();
  await expect(popup.getVerticalFlipCheckbox()).not.toBeChecked();

  await expect(popup.getRemoveCenterXKeyframeButton()).not.toBeVisible();
  await expect(popup.getRemoveRotationKeyframeButton()).not.toBeVisible();
  await expect(popup.getRemoveScaleKeyframeButton()).not.toBeVisible();
});
