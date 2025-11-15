import * as v from "valibot";
import { browser } from "wxt/browser";
import type { AnimationState } from "@/src/feature/animation-state";
import {
  AnimationStateSchema,
  DEFAULT_ANIMATION,
} from "@/src/feature/animation-state";
import {
  deleteAnimationState,
  getAnimationState,
  saveAnimationState,
} from "./state-storage";

export const UpdateAnimationStateMessageSchema = v.object({
  type: v.literal("UPDATE_ANIMATION_STATE"),
  animationState: v.nullable(v.partial(AnimationStateSchema)),
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
    await sendToContent({ tabId: tab.id, animationState: null });
    return;
  }

  const existed = await getAnimationState(tab.url);
  const merged = {
    ...DEFAULT_ANIMATION,
    ...existed,
    ...message.animationState,
  };

  await saveAnimationState({ url: tab.url, state: merged });
  await sendToContent({ tabId: tab.id, animationState: merged });
}

export async function sendUpdateAnimationStateMessage({
  animationState,
}: {
  animationState: Partial<AnimationState> | null;
}): Promise<void> {
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

  await sendToContent({ tabId, animationState });
}

export const UpdateContentMessageSchema = v.object({
  animationState: v.nullable(AnimationStateSchema),
});

type UpdateContentMessage = v.InferOutput<typeof UpdateContentMessageSchema>;

async function sendToContent({
  tabId,
  animationState,
}: {
  tabId: number;
  animationState: AnimationState | null;
}): Promise<void> {
  const message: UpdateContentMessage = {
    animationState,
  };
  await browser.tabs.sendMessage(tabId, message);
}
