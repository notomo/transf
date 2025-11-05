import * as v from "valibot";
import { browser } from "wxt/browser";
import {
  deleteAnimationState,
  getCurrentTabInfo,
} from "@/src/feature/animation-state";

export const ResetAnimationMessageSchema = v.object({
  type: v.literal("RESET_ANIMATION"),
});

type ResetAnimationMessage = v.InferOutput<typeof ResetAnimationMessageSchema>;

export async function handleResetAnimationMessage(
  message: ResetAnimationMessage,
) {
  const { tabId, url } = await getCurrentTabInfo();
  if (!tabId || !url)
    return { type: "message" as const, message: "No active tab found" };

  await deleteAnimationState(url);

  await browser.tabs.sendMessage(tabId, message);

  return { type: "message" as const, message: "Animation reset" };
}

export async function sendResetAnimationMessage(): Promise<void> {
  const message: ResetAnimationMessage = {
    type: "RESET_ANIMATION",
  };
  await browser.runtime.sendMessage(message);
}
