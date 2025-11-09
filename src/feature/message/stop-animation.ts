import * as v from "valibot";
import {
  AnimationStateSchema,
  getAnimationState,
  saveAnimationState,
  type Tab,
} from "@/src/feature/animation-state";
import { sendToContent } from "@/src/feature/message/update-content-animation-state";

export const StopAnimationMessageSchema = v.object({
  type: v.literal("STOP_ANIMATION"),
  animationState: AnimationStateSchema,
});

export async function handleStopAnimationMessage({ tab }: { tab: Tab }) {
  const animationState = await getAnimationState(tab.url);
  if (!animationState) {
    return;
  }

  const updatedState = {
    ...animationState,
    isPlaying: false,
  };

  await saveAnimationState(tab.url, updatedState);

  await sendToContent(tab.id, updatedState);
}
