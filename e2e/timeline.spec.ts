import { expect, test } from "./fixtures";
import { openPopup } from "./pages/popup";

test("can change current time by clicking timeline", async ({
  page,
  extensionId,
}) => {
  const popup = await openPopup({ page, extensionId });

  await popup.setTimelineValue(0.3);
  expect(await popup.getTimelineValue()).toBeCloseTo(0.3, 1);

  await popup.setTimelineValue(0);
  expect(await popup.getTimelineValue()).toBeCloseTo(0, 1);
});

test("can toggle play and stop button", async ({ page, extensionId }) => {
  const popup = await openPopup({ page, extensionId });

  await popup.getPlayButton().click();
  await popup.getStopButton().click();
  await popup.getPlayButton().click();
});
