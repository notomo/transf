import * as v from "valibot";
import { browser } from "wxt/browser";
import { deleteAnimationState } from "@/src/feature/animation-state";

export const ResetAnimationMessageSchema = v.object({
  type: v.literal("RESET_ANIMATION"),
});

type ResetAnimationMessage = v.InferOutput<typeof ResetAnimationMessageSchema>;

export async function handleResetAnimationMessage({
  message,
  tab,
}: {
  message: ResetAnimationMessage;
  tab: { tabId: number; url: string };
}) {
  await deleteAnimationState(tab.url);

  await browser.tabs.sendMessage(tab.tabId, message);

  return { type: "message" as const, message: "Animation reset" };
}

export async function sendResetAnimationMessage(): Promise<void> {
  const message: ResetAnimationMessage = {
    type: "RESET_ANIMATION",
  };
  await browser.runtime.sendMessage(message);
}
