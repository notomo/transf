import { useCallback, useEffect } from "react";
import { browser } from "wxt/browser";
import type { AnimationControllerState } from "@/src/feature/animation-controller";
import {
  createAnimationStateResponseMessage,
  type Message,
  type StartAnimationMessage,
  type UpdateAnimationStateMessage,
  validateMessage,
} from "@/src/feature/message";

export function useMessageHandler({
  controllerState,
  onStartAnimation,
  onStopAnimation,
  onUpdateAnimationState,
  onResetAnimation,
}: {
  controllerState: AnimationControllerState;
  onStartAnimation: (message: StartAnimationMessage) => void;
  onStopAnimation: () => void;
  onUpdateAnimationState: (message: UpdateAnimationStateMessage) => void;
  onResetAnimation: () => void;
}) {
  const handleMessage = useCallback(
    (message: Message, sendResponse: (response?: unknown) => void) => {
      console.log("Content script received message:", message.type);

      const typ = message.type;
      switch (typ) {
        case "START_ANIMATION":
          onStartAnimation(message);
          sendResponse({ success: true });
          break;

        case "STOP_ANIMATION":
          onStopAnimation();
          sendResponse({ success: true });
          break;

        case "UPDATE_ANIMATION_STATE":
          onUpdateAnimationState(message);
          sendResponse({ success: true });
          break;

        case "GET_ANIMATION_STATE":
          sendResponse(
            createAnimationStateResponseMessage(
              controllerState.currentAnimationState || undefined,
            ),
          );
          break;

        case "RESET_ANIMATION":
          onResetAnimation();
          sendResponse({ success: true });
          break;

        case "ANIMATION_STATE_RESPONSE":
        case "ANIMATION_PROGRESS":
          // These are response/notification messages, not handled in content script
          console.warn("Unexpected message type in content script:", typ);
          sendResponse({ success: false, error: "Unexpected message type" });
          break;

        default:
          typ satisfies never;
          console.warn("Unknown message type:", typ);
          sendResponse({ success: false, error: "Unknown message type" });
      }
    },
    [
      controllerState,
      onStartAnimation,
      onStopAnimation,
      onUpdateAnimationState,
      onResetAnimation,
    ],
  );

  useEffect(() => {
    const messageListener = (
      message: unknown,
      _sender: unknown,
      sendResponse: (response?: unknown) => void,
    ) => {
      try {
        const validatedMessage = validateMessage(message);
        handleMessage(validatedMessage, sendResponse);
        return true;
      } catch (error) {
        console.error("Invalid message received in content script:", error);
        return false;
      }
    };

    browser.runtime.onMessage.addListener(messageListener);

    return () => {
      browser.runtime.onMessage.removeListener(messageListener);
    };
  }, [handleMessage]);
}
