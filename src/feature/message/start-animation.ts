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

export const StartAnimationMessageSchema = v.object({
  type: v.literal("START_ANIMATION"),
  animationState: AnimationStateSchema,
});

type StartAnimationMessage = v.InferOutput<typeof StartAnimationMessageSchema>;

export async function handleStartAnimationMessage({
  message,
  tab,
}: {
  message: StartAnimationMessage;
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

export async function sendStartAnimationMessage(
  animationState: AnimationState,
): Promise<void> {
  const message: StartAnimationMessage = {
    type: "START_ANIMATION",
    animationState,
  };
  await browser.runtime.sendMessage(message);
}
