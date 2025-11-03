import * as v from "valibot";
import { browser } from "wxt/browser";
import {
  getAnimationState,
  getCurrentTabInfo,
  saveAnimationState,
} from "@/src/feature/animation-state";

export const StopAnimationMessageSchema = v.object({
  type: v.literal("STOP_ANIMATION"),
});

type StopAnimationMessage = v.InferOutput<typeof StopAnimationMessageSchema>;

export async function handleStopAnimationMessage(
  message: StopAnimationMessage,
) {
  const { tabId, url } = await getCurrentTabInfo();
  if (!tabId || !url)
    return { type: "message" as const, message: "No active tab found" };

  const currentState = await getAnimationState(url);
  if (currentState) {
    const updatedState = { ...currentState, isPlaying: false };
    await saveAnimationState(url, updatedState);

    await browser.tabs.sendMessage(tabId, message);
  }

  return { type: "message" as const, message: "Animation stopped" };
}
