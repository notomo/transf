import * as v from "valibot";
import { browser } from "wxt/browser";
import type { AnimationState, Tab } from "@/src/feature/animation-state";
import {
  AnimationStateSchema,
  getAnimationState,
  saveAnimationState,
} from "@/src/feature/animation-state";

export const UpdateAnimationStateMessageSchema = v.object({
  type: v.literal("UPDATE_ANIMATION_STATE"),
  animationState: AnimationStateSchema,
});

export type UpdateAnimationStateMessage = v.InferOutput<
  typeof UpdateAnimationStateMessageSchema
>;

export async function handleUpdateAnimationStateMessage({
  message,
  tab,
}: {
  message: UpdateAnimationStateMessage;
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

export async function sendUpdateAnimationStateMessage(
  animationState: AnimationState,
): Promise<void> {
  const message: UpdateAnimationStateMessage = {
    type: "UPDATE_ANIMATION_STATE",
    animationState,
  };
  await browser.runtime.sendMessage(message);
}

export async function restoreAnimationForTab(tabId: number): Promise<void> {
  const tab = await browser.tabs.get(tabId);
  if (!tab.url) {
    return;
  }

  const animationState = await getAnimationState(tab.url);
  if (!animationState) {
    return;
  }

  const message: UpdateAnimationStateMessage = {
    type: "UPDATE_ANIMATION_STATE",
    animationState,
  };
  await browser.tabs.sendMessage(tabId, message);
}
