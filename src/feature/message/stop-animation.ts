import * as v from "valibot";
import { browser } from "wxt/browser";
import {
  getAnimationState,
  saveAnimationState,
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
  tab: { tabId: number; url: string };
}) {
  const currentState = await getAnimationState(tab.url);
  if (currentState) {
    const updatedState = { ...currentState, isPlaying: false };
    await saveAnimationState(tab.url, updatedState);

    await browser.tabs.sendMessage(tab.tabId, message);
  }

  return { type: "message" as const, message: "Animation stopped" };
}
