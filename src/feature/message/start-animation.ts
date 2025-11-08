import * as v from "valibot";
import { browser } from "wxt/browser";
import type { AnimationState, Tab } from "@/src/feature/animation-state";
import {
  AnimationStateSchema,
  getAnimationState,
  saveAnimationState,
} from "@/src/feature/animation-state";

export const StartAnimationMessageSchema = v.object({
  type: v.literal("START_ANIMATION"),
  animationState: AnimationStateSchema,
});

export type StartAnimationMessage = v.InferOutput<
  typeof StartAnimationMessageSchema
>;

export async function handleStartAnimationMessage({
  message,
  tab,
}: {
  message: StartAnimationMessage;
  tab: Tab;
}) {
  const existingState = await getAnimationState(tab.url);
  const mergedState: AnimationState = {
    ...message.animationState,
    animationName:
      existingState?.animationName ?? message.animationState.animationName,
  };

  await saveAnimationState(tab.url, mergedState);

  await browser.tabs.sendMessage(tab.id, {
    ...message,
    animationState: mergedState,
  });
}

export async function sendStartAnimationMessage(
  animationState: AnimationState,
): Promise<void> {
  const message: StartAnimationMessage = {
    type: "START_ANIMATION",
    animationState,
  };
  await browser.runtime.sendMessage(message);
}
