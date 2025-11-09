import * as v from "valibot";
import { browser } from "wxt/browser";
import {
  getAnimationState,
  saveAnimationState,
  type Tab,
} from "@/src/feature/animation-state";

export const StopAnimationMessageSchema = v.object({
  type: v.literal("STOP_ANIMATION"),
});

type StopAnimationMessage = v.InferOutput<typeof StopAnimationMessageSchema>;

export async function handleStopAnimationMessage({
  message,
  tab,
}: {
  message: StopAnimationMessage;
  tab: Tab;
}) {
  const animationState = await getAnimationState(tab.url);
  if (!animationState) {
    return;
  }

  await saveAnimationState(tab.url, {
    ...animationState,
    isPlaying: false,
  });

  await browser.tabs.sendMessage(tab.id, message);
}
