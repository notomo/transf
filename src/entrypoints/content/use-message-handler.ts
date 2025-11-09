import { useEffect, useEffectEvent } from "react";
import { browser } from "wxt/browser";
import { validateMessageInContent } from "@/src/feature/message";
import type { StartAnimationMessage } from "@/src/feature/message/start-animation";
import type { StopAnimationMessage } from "@/src/feature/message/stop-animation";
import type { UpdateAnimationStateMessage } from "@/src/feature/message/update-animation-state";

export function useMessageHandler({
  onStartAnimation,
  onStopAnimation,
  onUpdateAnimationState,
  onResetAnimation,
}: {
  onStartAnimation: (message: StartAnimationMessage) => void;
  onStopAnimation: (message: StopAnimationMessage) => void;
  onUpdateAnimationState: (message: UpdateAnimationStateMessage) => void;
  onResetAnimation: () => void;
}) {
  const handleMessageEvent = useEffectEvent(async (rawMessage: unknown) => {
    await handleMessage({
      rawMessage,
      onStartAnimation,
      onStopAnimation,
      onUpdateAnimationState,
      onResetAnimation,
    });
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

async function handleMessage({
  rawMessage,
  onStartAnimation,
  onStopAnimation,
  onUpdateAnimationState,
  onResetAnimation,
}: {
  rawMessage: unknown;
  onStartAnimation: (message: StartAnimationMessage) => void;
  onStopAnimation: (message: StopAnimationMessage) => void;
  onUpdateAnimationState: (message: UpdateAnimationStateMessage) => void;
  onResetAnimation: () => void;
}) {
  const message = validateMessageInContent(rawMessage);
  const typ = message.type;
  switch (typ) {
    case "START_ANIMATION":
      onStartAnimation(message);
      return;

    case "STOP_ANIMATION":
      onStopAnimation(message);
      return;

    case "UPDATE_ANIMATION_STATE":
      onUpdateAnimationState(message);
      return;

    case "RESET_ANIMATION":
      onResetAnimation();
      return;

    default:
      throw new Error(`unexpected message type: ${typ satisfies never}`);
  }
}
