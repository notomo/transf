import * as v from "valibot";
import { browser } from "wxt/browser";
import type { AnimationState } from "@/src/feature/animation-state";
import {
  AnimationStateSchema,
  getCurrentTabInfo,
  saveAnimationState,
} from "@/src/feature/animation-state";

export const StartAnimationMessageSchema = v.object({
  type: v.literal("START_ANIMATION"),
  animationState: AnimationStateSchema,
});

export type StartAnimationMessage = v.InferOutput<
  typeof StartAnimationMessageSchema
>;

export async function handleStartAnimationMessage(
  message: StartAnimationMessage,
) {
  const { tabId, url } = await getCurrentTabInfo();
  if (!tabId || !url)
    return { type: "message" as const, message: "No active tab found" };

  await saveAnimationState(url, message.animationState);

  await browser.tabs.sendMessage(tabId, message);

  return { type: "message" as const, message: "Animation started" };
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
