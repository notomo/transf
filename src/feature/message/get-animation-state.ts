import * as v from "valibot";
import { browser } from "wxt/browser";
import type { AnimationState } from "@/src/feature/animation-state";
import {
  AnimationStateSchema,
  getAnimationState,
  getCurrentTabInfo,
} from "@/src/feature/animation-state";

const AnimationStateResponseMessageSchema = v.object({
  type: v.literal("ANIMATION_STATE_RESPONSE"),
  animationState: v.optional(AnimationStateSchema),
});

type AnimationStateResponseMessage = v.InferOutput<
  typeof AnimationStateResponseMessageSchema
>;

export function createAnimationStateResponseMessage(
  animationState?: AnimationState,
): AnimationStateResponseMessage {
  return {
    type: "ANIMATION_STATE_RESPONSE",
    animationState,
  };
}

export const GetAnimationStateMessageSchema = v.object({
  type: v.literal("GET_ANIMATION_STATE"),
});

type GetAnimationStateMessage = v.InferOutput<
  typeof GetAnimationStateMessageSchema
>;

export async function handleGetAnimationStateMessage(
  _message: GetAnimationStateMessage,
) {
  const { url } = await getCurrentTabInfo();
  const state = await getAnimationState(url);

  return {
    type: "response" as const,
    response: createAnimationStateResponseMessage(state),
  };
}

export async function sendGetAnimationStateMessage(): Promise<AnimationStateResponseMessage> {
  const message: GetAnimationStateMessage = {
    type: "GET_ANIMATION_STATE",
  };
  const response = await browser.runtime.sendMessage(message);
  return v.parse(AnimationStateResponseMessageSchema, response);
}
