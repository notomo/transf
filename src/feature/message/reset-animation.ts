import * as v from "valibot";
import { browser } from "wxt/browser";
import { deleteAnimationState, type Tab } from "@/src/feature/animation-state";
import { sendToContent } from "@/src/feature/message/update-content-animation-state";

export const ResetAnimationMessageSchema = v.object({
  type: v.literal("RESET_ANIMATION"),
});

type ResetAnimationMessage = v.InferOutput<typeof ResetAnimationMessageSchema>;

export async function handleResetAnimationMessage({ tab }: { tab: Tab }) {
  await deleteAnimationState(tab.url);

  await sendToContent(tab.id, null);
}

export async function sendResetAnimationMessage(): Promise<void> {
  const message: ResetAnimationMessage = {
    type: "RESET_ANIMATION",
  };
  await browser.runtime.sendMessage(message);
}
