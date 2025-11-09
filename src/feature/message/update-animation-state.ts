import * as v from "valibot";
import { browser } from "wxt/browser";
import type { AnimationState, Tab } from "@/src/feature/animation-state";
import {
  AnimationStateSchema,
  generateAnimationName,
  getAnimationState,
  saveAnimationState,
} from "@/src/feature/animation-state";
import { sendToContent } from "@/src/feature/message/update-content-animation-state";

export const UpdateAnimationStateMessageSchema = v.object({
  type: v.literal("UPDATE_ANIMATION_STATE"),
  animationState: AnimationStateSchema,
});

type UpdateAnimationStateMessage = v.InferOutput<
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
  const animationName =
    existingState?.animationName ??
    message.animationState.animationName ??
    generateAnimationName();

  const mergedState: AnimationState = {
    ...message.animationState,
    animationName,
  };

  await saveAnimationState(tab.url, mergedState);

  await sendToContent(tab.id, mergedState);
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

  await sendToContent(tabId, animationState);
}
