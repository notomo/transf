import * as v from "valibot";
import { browser } from "wxt/browser";
import {
  getAnimationState,
  saveAnimationState,
  type Tab,
} from "@/src/feature/animation-state";

export const AnimationProgressMessageSchema = v.object({
  type: v.literal("ANIMATION_PROGRESS"),
  currentTime: v.number(),
  isPlaying: v.boolean(),
  animationName: v.optional(v.string()),
});

export type AnimationProgressMessage = v.InferOutput<
  typeof AnimationProgressMessageSchema
>;

export async function handleAnimationProgressMessage({
  message,
  tab,
}: {
  message: AnimationProgressMessage;
  tab: Tab;
}) {
  const animationState = await getAnimationState(tab.url);
  if (!animationState) {
    return;
  }

  await saveAnimationState(tab.url, {
    ...animationState,
    currentTime: message.currentTime,
    isPlaying: message.isPlaying,
    animationName: message.animationName ?? animationState.animationName,
  });
}

export async function sendAnimationProgressMessage(
  currentTime: number,
  isPlaying: boolean,
  animationName?: string,
): Promise<void> {
  const message: AnimationProgressMessage = {
    type: "ANIMATION_PROGRESS",
    currentTime,
    isPlaying,
    animationName,
  };
  await browser.runtime.sendMessage(message);
}
