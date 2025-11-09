import * as v from "valibot";
import { browser } from "wxt/browser";
import {
  AnimationStateSchema,
  getAnimationState,
  saveAnimationState,
  type Tab,
} from "@/src/feature/animation-state";

export const StopAnimationMessageSchema = v.object({
  type: v.literal("STOP_ANIMATION"),
  animationState: AnimationStateSchema,
});

export type StopAnimationMessage = v.InferOutput<
  typeof StopAnimationMessageSchema
>;

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

  const updatedState = {
    ...animationState,
    isPlaying: false,
  };

  await saveAnimationState(tab.url, updatedState);

  await browser.tabs.sendMessage(tab.id, {
    ...message,
    animationState: updatedState,
  });
}
