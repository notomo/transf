import { useEffect, useEffectEvent } from "react";
import { browser } from "wxt/browser";
import type { AnimationState } from "@/src/feature/animation-state";
import { validateMessageInContent } from "@/src/feature/message";

export function useMessageHandler({
  onUpdateState,
}: {
  onUpdateState: (state: AnimationState | null) => void;
}) {
  const handleMessageEvent = useEffectEvent(async (rawMessage: unknown) => {
    const message = validateMessageInContent(rawMessage);
    const state = message.animationState;
    onUpdateState(state);
  });

  useEffect(() => {
    const messageListener = (
      rawMessage: unknown,
      _sender: unknown,
      sendResponse: (response?: unknown) => void,
    ) => {
      handleMessageEvent(rawMessage).then(() => {
        sendResponse({ success: true });
      });
      // Return true to indicate async response
      return true;
    };

    browser.runtime.onMessage.addListener(messageListener);

    return () => {
      browser.runtime.onMessage.removeListener(messageListener);
    };
  }, []);
}
