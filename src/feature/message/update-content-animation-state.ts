import * as v from "valibot";
import { browser } from "wxt/browser";
import {
  type AnimationState,
  AnimationStateSchema,
} from "@/src/feature/animation-state";

export const UpdateContentAnimationStateMessageSchema = v.object({
  type: v.literal("UPDATE_CONTENT_ANIMATION_STATE"),
  animationState: v.nullable(AnimationStateSchema),
});

type UpdateContentAnimationStateMessage = v.InferOutput<
  typeof UpdateContentAnimationStateMessageSchema
>;

export async function sendToContent(
  tabId: number,
  animationState: AnimationState | null,
): Promise<void> {
  const message: UpdateContentAnimationStateMessage = {
    type: "UPDATE_CONTENT_ANIMATION_STATE",
    animationState,
  };
  await browser.tabs.sendMessage(tabId, message);
}
