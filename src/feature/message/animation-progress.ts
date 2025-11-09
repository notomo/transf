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
});

type AnimationProgressMessage = v.InferOutput<
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
  });
}

export async function sendAnimationProgressMessage(
  currentTime: number,
): Promise<void> {
  const message: AnimationProgressMessage = {
    type: "ANIMATION_PROGRESS",
    currentTime,
  };
  await browser.runtime.sendMessage(message);
}
