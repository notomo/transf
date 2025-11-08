import * as v from "valibot";
import { browser } from "wxt/browser";
import {
  getAnimationState,
  saveAnimationState,
  type Tab,
} from "@/src/feature/animation-state";

export const StopAnimationMessageSchema = v.object({
  type: v.literal("STOP_ANIMATION"),
});

type StopAnimationMessage = v.InferOutput<typeof StopAnimationMessageSchema>;

export async function handleStopAnimationMessage({
  message,
  tab,
}: {
  message: StopAnimationMessage;
  tab: Tab;
}) {
  const currentState = await getAnimationState(tab.url);
  if (currentState) {
    const updatedState = { ...currentState, isPlaying: false };
    await saveAnimationState(tab.url, updatedState);

    await browser.tabs.sendMessage(tab.id, message);
  }
}
