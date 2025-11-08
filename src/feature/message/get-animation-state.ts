import * as v from "valibot";
import { browser } from "wxt/browser";
import {
  AnimationStateSchema,
  getAnimationState,
  type Tab,
} from "@/src/feature/animation-state";

const AnimationStateResponseMessageSchema = v.object({
  type: v.literal("ANIMATION_STATE_RESPONSE"),
  animationState: v.optional(AnimationStateSchema),
});

type AnimationStateResponseMessage = v.InferOutput<
  typeof AnimationStateResponseMessageSchema
>;

export const GetAnimationStateMessageSchema = v.object({
  type: v.literal("GET_ANIMATION_STATE"),
});

type GetAnimationStateMessage = v.InferOutput<
  typeof GetAnimationStateMessageSchema
>;

export async function handleGetAnimationStateMessage({
  message: _message,
  tab,
}: {
  message: GetAnimationStateMessage;
  tab: Tab;
}): Promise<AnimationStateResponseMessage> {
  const animationState = await getAnimationState(tab.url);
  return {
    type: "ANIMATION_STATE_RESPONSE",
    animationState,
  };
}

export async function sendGetAnimationStateMessage(): Promise<AnimationStateResponseMessage> {
  const message: GetAnimationStateMessage = {
    type: "GET_ANIMATION_STATE",
  };
  const response = await browser.runtime.sendMessage(message);
  return v.parse(AnimationStateResponseMessageSchema, response);
}
