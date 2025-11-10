import { useEffect, useEffectEvent } from "react";
import { browser } from "wxt/browser";
import type { AnimationState } from "@/src/feature/animation-state";
import { validateMessageInContent } from "@/src/feature/message";

export function useMessageHandler({
  onUpdateState,
}: {
  onUpdateState: (state: AnimationState | null) => void;
}) {
  const handleMessage = useEffectEvent(async (rawMessage: unknown) => {
    const message = validateMessageInContent(rawMessage);
    onUpdateState(message.animationState);
  });

  useEffect(() => {
    const handler = (
      rawMessage: unknown,
      _sender: unknown,
      sendResponse: (response?: unknown) => void,
    ) => {
      handleMessage(rawMessage).then(() => {
        sendResponse({ success: true });
      });
      // Return true to indicate async response
      return true;
    };

    browser.runtime.onMessage.addListener(handler);

    return () => {
      browser.runtime.onMessage.removeListener(handler);
    };
  }, []);
}
