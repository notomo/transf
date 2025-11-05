import { useEffect, useEffectEvent } from "react";
import { browser } from "wxt/browser";
import type { AnimationControllerState } from "@/src/feature/animation-controller";
import {
  type MessageInContent,
  validateMessageInContent,
} from "@/src/feature/message";
import { createAnimationStateResponseMessage } from "@/src/feature/message/animation-state-response";
import type { StartAnimationMessage } from "@/src/feature/message/start-animation";
import type { UpdateAnimationStateMessage } from "@/src/feature/message/update-animation-state";

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
  const handleMessage = useEffectEvent(
    (message: MessageInContent, sendResponse: (response?: unknown) => void) => {
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

        default:
          typ satisfies never;
          console.warn("Unknown message type:", typ);
          sendResponse({ success: false, error: "Unknown message type" });
      }
    },
  );

  useEffect(() => {
    const messageListener = (
      message: unknown,
      _sender: unknown,
      sendResponse: (response?: unknown) => void,
    ) => {
      const validatedMessage = validateMessageInContent(message);
      handleMessage(validatedMessage, sendResponse);
      return true;
    };

    browser.runtime.onMessage.addListener(messageListener);

    return () => {
      browser.runtime.onMessage.removeListener(messageListener);
    };
  }, []);
}
