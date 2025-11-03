import * as v from "valibot";
import { browser } from "wxt/browser";
import {
  getAnimationState,
  getCurrentTabInfo,
} from "@/src/feature/animation-state";
import {
  type AnimationStateResponseMessage,
  AnimationStateResponseMessageSchema,
  createAnimationStateResponseMessage,
} from "@/src/feature/message/animation-state-response";

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
