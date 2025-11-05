import { useEffect, useEffectEvent } from "react";
import { browser } from "wxt/browser";
import type { AnimationControllerState } from "@/src/feature/animation-controller";
import { validateMessageInContent } from "@/src/feature/message";
import { createAnimationStateResponseMessage } from "@/src/feature/message/get-animation-state";
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
  const handleMessageEvent = useEffectEvent(async (rawMessage: unknown) => {
    await handleMessage({
      rawMessage,
      controllerState,
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
      handleMessageEvent(rawMessage).then((response) => {
        sendResponse(response);
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
  controllerState,
  onStartAnimation,
  onStopAnimation,
  onUpdateAnimationState,
  onResetAnimation,
}: {
  rawMessage: unknown;
  controllerState: AnimationControllerState;
  onStartAnimation: (message: StartAnimationMessage) => void;
  onStopAnimation: () => void;
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
      onStopAnimation();
      return { success: true };

    case "UPDATE_ANIMATION_STATE":
      onUpdateAnimationState(message);
      return { success: true };

    case "GET_ANIMATION_STATE":
      return createAnimationStateResponseMessage(
        controllerState.currentAnimationState || undefined,
      );

    case "RESET_ANIMATION":
      onResetAnimation();
      return { success: true };

    default:
      throw new Error(`unexpected message type: ${typ satisfies never}`);
  }
}
