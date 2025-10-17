import type { Page } from "@playwright/test";

export async function openPopup({
  page,
  extensionId,
}: {
  page: Page;
  extensionId: string;
}) {
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  page.getByText("Page Transform").click();

  const popup = {
    getResetButton: () => page.getByRole("button", { name: "Reset" }),
    getCenterXSlider: () => page.getByLabel(/Center X/),
    getCenterYSlider: () => page.getByLabel(/Center Y/),
    getRotationSlider: () => page.getByLabel(/Rotation/),
    getScaleSlider: () => page.getByLabel(/Scale/),
    getTranslateXSlider: () => page.getByLabel(/Translate X/),
    getTranslateYSlider: () => page.getByLabel(/Translate Y/),
    getHorizontalFlipCheckbox: () => page.getByLabel("Horizontal Flip"),
    getVerticalFlipCheckbox: () => page.getByLabel("Vertical Flip"),
    getAddCenterXKeyframeButton: () => page.getByTitle("Add Center X keyframe"),
    getRemoveCenterXKeyframeButton: () =>
      page.getByTitle("Remove Center X keyframe"),
    getAddCenterYKeyframeButton: () => page.getByTitle("Add Center Y keyframe"),
    getRemoveCenterYKeyframeButton: () =>
      page.getByTitle("Remove Center Y keyframe"),
    getAddRotationKeyframeButton: () =>
      page.getByTitle("Add Rotation keyframe"),
    getRemoveRotationKeyframeButton: () =>
      page.getByTitle("Remove Rotation keyframe"),
    getAddScaleKeyframeButton: () => page.getByTitle("Add Scale keyframe"),
    getRemoveScaleKeyframeButton: () =>
      page.getByTitle("Remove Scale keyframe"),
    getAddTranslateXKeyframeButton: () =>
      page.getByTitle("Add Translate X keyframe"),
    getRemoveTranslateXKeyframeButton: () =>
      page.getByTitle("Remove Translate X keyframe"),
    getAddTranslateYKeyframeButton: () =>
      page.getByTitle("Add Translate Y keyframe"),
    getRemoveTranslateYKeyframeButton: () =>
      page.getByTitle("Remove Translate Y keyframe"),
    getAddHorizontalFlipKeyframeButton: () =>
      page.getByTitle("Add Horizontal Flip keyframe"),
    getRemoveHorizontalFlipKeyframeButton: () =>
      page.getByTitle("Remove Horizontal Flip keyframe"),
    getAddVerticalFlipKeyframeButton: () =>
      page.getByTitle("Add Vertical Flip keyframe"),
    getRemoveVerticalFlipKeyframeButton: () =>
      page.getByTitle("Remove Vertical Flip keyframe"),
    getPrevKeyframeButton: () => page.getByTitle("Previous keyframe"),
    getNextKeyframeButton: () => page.getByTitle("Next keyframe"),
    getTimelineSlider: () => page.getByLabel("Timeline"),
    getDurationSlider: () => page.getByLabel(/Duration/),
    clickReset: async () => {
      const resetButton = popup.getResetButton();
      await resetButton.click();
    },
  };
  return popup;
}
