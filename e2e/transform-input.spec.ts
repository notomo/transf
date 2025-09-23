import { expect, test } from "./fixtures";
import { openPopup } from "./pages/popup";

test("UI displays values correctly with labels", async ({
  page,
  extensionId,
}) => {
  const popup = await openPopup({ page, extensionId });

  await popup.getRotationSlider().fill("90");
  await expect(page.getByText("Rotation (degrees): 90")).toBeVisible();

  await popup.getScaleSlider().fill("1.5");
  await expect(page.getByText("Scale: 1.5x")).toBeVisible();

  await popup.getTranslateXSlider().fill("200");
  await expect(page.getByText("Translate X (px): 200")).toBeVisible();

  await popup.getTranslateYSlider().fill("-100");
  await expect(page.getByText("Translate Y (px): -100")).toBeVisible();

  await popup.getCenterXSlider().fill("30");
  await expect(page.getByText("Center X (%): 30")).toBeVisible();

  await popup.getCenterYSlider().fill("70");
  await expect(page.getByText("Center Y (%): 70")).toBeVisible();
});
