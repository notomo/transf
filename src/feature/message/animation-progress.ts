import * as v from "valibot";
import { browser } from "wxt/browser";
import {
  getAnimationState,
  getCurrentTabInfo,
  saveAnimationState,
} from "@/src/feature/animation-state";

export const AnimationProgressMessageSchema = v.object({
  type: v.literal("ANIMATION_PROGRESS"),
  currentTime: v.number(),
  isPlaying: v.boolean(),
});

export type AnimationProgressMessage = v.InferOutput<
  typeof AnimationProgressMessageSchema
>;

export async function handleAnimationProgressMessage(
  message: AnimationProgressMessage,
) {
  const { tabId, url } = await getCurrentTabInfo();
  if (!tabId || !url)
    return { type: "message" as const, message: "No active tab found" };

  const currentState = await getAnimationState(url);
  if (currentState) {
    const updatedState = {
      ...currentState,
      currentTime: message.currentTime,
      isPlaying: message.isPlaying,
    };
    await saveAnimationState(url, updatedState);
  }

  return { type: "message" as const, message: "Animation progress updated" };
}

export async function sendAnimationProgressMessage(
  currentTime: number,
  isPlaying: boolean,
): Promise<void> {
  const message: AnimationProgressMessage = {
    type: "ANIMATION_PROGRESS",
    currentTime,
    isPlaying,
  };
  await browser.runtime.sendMessage(message);
}
