import * as v from "valibot";
import { browser } from "wxt/browser";
import type { AnimationState } from "@/src/feature/animation-state";
import {
  AnimationStateSchema,
  getAnimationState,
  getCurrentTabInfo,
  saveAnimationState,
} from "@/src/feature/animation-state";

export const UpdateAnimationStateMessageSchema = v.object({
  type: v.literal("UPDATE_ANIMATION_STATE"),
  animationState: AnimationStateSchema,
});

export type UpdateAnimationStateMessage = v.InferOutput<
  typeof UpdateAnimationStateMessageSchema
>;

export async function handleUpdateAnimationStateMessage(
  message: UpdateAnimationStateMessage,
) {
  const { tabId, url } = await getCurrentTabInfo();
  if (!tabId || !url)
    return { type: "message" as const, message: "No active tab found" };

  await saveAnimationState(url, message.animationState);

  await browser.tabs.sendMessage(tabId, message);

  return { type: "message" as const, message: "Animation state updated" };
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
  if (!tab.url) return;

  const savedState = await getAnimationState(tab.url);
  if (savedState) {
    const message: UpdateAnimationStateMessage = {
      type: "UPDATE_ANIMATION_STATE",
      animationState: savedState,
    };
    await browser.tabs.sendMessage(tabId, message);
  }
}
