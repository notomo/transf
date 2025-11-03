import * as v from "valibot";
import type { AnimationState } from "@/src/feature/animation-state";
import { AnimationStateSchema } from "@/src/feature/animation-state";

export const AnimationStateResponseMessageSchema = v.object({
  type: v.literal("ANIMATION_STATE_RESPONSE"),
  animationState: v.optional(AnimationStateSchema),
});

export type AnimationStateResponseMessage = v.InferOutput<
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
