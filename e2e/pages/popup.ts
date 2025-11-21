import type { Page } from "@playwright/test";

export async function openPopup({
  page,
  extensionId,
}: {
  page: Page;
  extensionId: string;
}) {
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  await page.getByText("Page Transform").click();

  const popup = {
    getResetButton: () => page.getByRole("button", { name: "Reset" }),
    getCenterXSlider: () => page.getByRole("slider", { name: /Center X/ }),
    getCenterYSlider: () => page.getByRole("slider", { name: /Center Y/ }),
    getRotationSlider: () => page.getByRole("slider", { name: /Rotation/ }),
    getScaleSlider: () => page.getByRole("slider", { name: /Scale/ }),
    getTranslateXSlider: () =>
      page.getByRole("slider", { name: /Translate X/ }),
    getTranslateYSlider: () =>
      page.getByRole("slider", { name: /Translate Y/ }),
    getHorizontalFlipCheckbox: () =>
      page.getByRole("checkbox", { name: "Horizontal Flip" }),
    getVerticalFlipCheckbox: () =>
      page.getByRole("checkbox", { name: "Vertical Flip" }),
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
    getTimelineSlider: () => page.getByLabel(/Timeline/),
    getDurationSlider: () => page.getByLabel(/Duration/),
    getPlayStopButton: () => page.getByRole("button", { name: /[▶■]/ }),
    getKeyframeTimeline: (fieldLabel: string) =>
      page.getByLabel(
        new RegExp(
          `Keyframe timeline: ${fieldLabel} \\(double-click to add\\)`,
        ),
      ),
    getKeyframeButton: (percentage: number) =>
      page.getByRole("button", {
        name: new RegExp(`Jump to keyframe at ${percentage}%`),
      }),
    setTimelineValue: async (value: number) => {
      const slider = page.getByLabel(/Timeline/);
      const box = await slider.boundingBox();
      if (!box) throw new Error("Timeline slider not found");
      const x = box.x + box.width * value;
      const y = box.y + box.height / 2;
      await page.mouse.click(x, y);
    },
    doubleClickKeyframeTimeline: async ({
      fieldLabel,
      position,
    }: {
      fieldLabel: string;
      position: number;
    }) => {
      const keyframeTimeline = popup.getKeyframeTimeline(fieldLabel);
      const box = await keyframeTimeline.boundingBox();
      if (!box) throw new Error("Keyframe timeline not found");

      const clickX = box.x + box.width * position;
      const clickY = box.y + box.height / 2;
      await page.mouse.dblclick(clickX, clickY);
    },
    dragKeyframe: async ({
      fieldLabel,
      fromPercentage,
      toValue,
    }: {
      fieldLabel: string;
      fromPercentage: number;
      toValue: number;
    }) => {
      const keyframeButton = popup.getKeyframeButton(fromPercentage);
      const keyframeTimeline = popup.getKeyframeTimeline(fieldLabel);

      const buttonBox = await keyframeButton.boundingBox();
      const timelineBox = await keyframeTimeline.boundingBox();
      if (!buttonBox || !timelineBox) {
        throw new Error("Elements not found for drag operation");
      }

      const startX = buttonBox.x + buttonBox.width / 2;
      const startY = buttonBox.y + buttonBox.height / 2;
      const endX = timelineBox.x + timelineBox.width * toValue;
      const endY = startY;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(endX, endY);
      await page.mouse.up();
    },
    clickReset: async () => {
      const resetButton = popup.getResetButton();
      await resetButton.click();
    },
  };
  return popup;
}
