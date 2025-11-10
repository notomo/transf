import * as v from "valibot";
import { browser } from "wxt/browser";
import type { AnimationState, Tab } from "@/src/feature/animation-state";
import {
  AnimationStateSchema,
  deleteAnimationState,
  getAnimationState,
  saveAnimationState,
} from "@/src/feature/animation-state";
import { sendToContent } from "@/src/feature/message/update-content-animation-state";

export const UpdateAnimationStateMessageSchema = v.object({
  type: v.literal("UPDATE_ANIMATION_STATE"),
  animationState: v.union([v.partial(AnimationStateSchema), v.null()]),
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
  tab: Tab;
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
