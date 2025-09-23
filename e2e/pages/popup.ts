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
    clickReset: async () => {
      const resetButton = popup.getResetButton();
      await resetButton.click();
    },
  };
  return popup;
}
