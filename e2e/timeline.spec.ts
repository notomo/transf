import { expect, test } from "./fixtures";
import { openPopup } from "./pages/popup";

test("can change current time by clicking timeline", async ({
  page,
  extensionId,
}) => {
  const popup = await openPopup({ page, extensionId });

  await popup.setTimelineValue(0.3);
  const timeline = popup.getTimelineSlider();
  const value1 = await timeline.getAttribute("aria-valuenow");
  expect(Number(value1)).toBeCloseTo(0.3, 1);

  await popup.setTimelineValue(0);
  const value3 = await timeline.getAttribute("aria-valuenow");
  expect(Number(value3)).toBeCloseTo(0, 1);
});

test("can toggle play and stop button", async ({ page, extensionId }) => {
  const popup = await openPopup({ page, extensionId });
  const playStopButton = popup.getPlayStopButton();

  await expect(playStopButton).toHaveText("▶");
  await playStopButton.click();

  await expect(playStopButton).toHaveText("■");
  await playStopButton.click();

  await expect(playStopButton).toHaveText("▶");
});
