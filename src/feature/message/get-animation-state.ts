import * as v from "valibot";
import { browser } from "wxt/browser";
import { AnimationStateSchema } from "@/src/feature/animation-state";
import { getAnimationState } from "./state-storage";

const AnimationStateResponseSchema = v.object({
  animationState: v.optional(AnimationStateSchema),
});

type AnimationStateResponse = v.InferOutput<
  typeof AnimationStateResponseSchema
>;

export const GetAnimationStateMessageSchema = v.object({
  type: v.literal("GET_ANIMATION_STATE"),
});

type GetAnimationStateMessage = v.InferOutput<
  typeof GetAnimationStateMessageSchema
>;

export async function handleGetAnimationStateMessage({
  tab,
}: {
  tab: { url: string };
}): Promise<AnimationStateResponse> {
  const animationState = await getAnimationState(tab.url);
  return {
    animationState,
  };
}

export async function sendGetAnimationStateMessage(): Promise<AnimationStateResponse> {
  const message: GetAnimationStateMessage = {
    type: "GET_ANIMATION_STATE",
  };
  const response = await browser.runtime.sendMessage(message);
  return v.parse(AnimationStateResponseSchema, response);
}
