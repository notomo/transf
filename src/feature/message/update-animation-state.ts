import * as v from "valibot";
import { browser } from "wxt/browser";
import type { AnimationState } from "@/src/feature/animation-state";
import { AnimationStateSchema } from "@/src/feature/animation-state";
import {
  deleteAnimationState,
  getAnimationState,
  saveAnimationState,
} from "./state-storage";

export const UpdateAnimationStateMessageSchema = v.object({
  type: v.literal("UPDATE_ANIMATION_STATE"),
  animationState: v.nullable(v.partial(AnimationStateSchema)),
  syncToContent: v.boolean(),
});

type UpdateAnimationStateMessage = v.InferOutput<
  typeof UpdateAnimationStateMessageSchema
>;

export async function handleUpdateAnimationStateMessage({
  message,
  tab,
}: {
  message: UpdateAnimationStateMessage;
  tab: { id: number; url: string };
}) {
  if (message.animationState === null) {
    await deleteAnimationState(tab.url);
    if (message.syncToContent) {
      await sendToContent(tab.id, null);
    }
    return;
  }

  const existingState = await getAnimationState(tab.url);
  const mergedState = existingState
    ? { ...existingState, ...message.animationState }
    : (message.animationState as AnimationState);

  await saveAnimationState(tab.url, mergedState);

  if (message.syncToContent) {
    await sendToContent(tab.id, mergedState);
  }
}

export async function sendUpdateAnimationStateMessage(
  animationState: Partial<AnimationState> | null,
  syncToContent: boolean,
): Promise<void> {
  const message: UpdateAnimationStateMessage = {
    type: "UPDATE_ANIMATION_STATE",
    animationState,
    syncToContent,
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

export const UpdateContentMessageSchema = v.object({
  animationState: v.nullable(AnimationStateSchema),
});

type UpdateContentMessage = v.InferOutput<typeof UpdateContentMessageSchema>;

async function sendToContent(
  tabId: number,
  animationState: AnimationState | null,
): Promise<void> {
  const message: UpdateContentMessage = {
    animationState,
  };
  await browser.tabs.sendMessage(tabId, message);
}
