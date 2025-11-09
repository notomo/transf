import { useCallback, useState } from "react";
import {
  type AnimationControllerState,
  createAnimationControllerState,
  resetAnimation,
  startAnimation,
  stopAnimation,
  updateAnimationState,
} from "@/src/feature/animation-controller";
import type { StartAnimationMessage } from "@/src/feature/message/start-animation";
import type { UpdateAnimationStateMessage } from "@/src/feature/message/update-animation-state";
import { useMessageHandler } from "./use-message-handler";
import { useProgressTracking } from "./use-progress-tracking";
import { useStyleInjection } from "./use-style-injection";

export function AnimationController() {
  const {
    controllerState,
    setControllerState,
    handleStartAnimation,
    handleStopAnimation,
    handleUpdateAnimationState,
    handleResetAnimation,
  } = useAnimationController();

  const { clearStyles } = useStyleInjection(controllerState);

  useProgressTracking(controllerState, setControllerState);

  useMessageHandler({
    onStartAnimation: handleStartAnimation,
    onStopAnimation: handleStopAnimation,
    onUpdateAnimationState: handleUpdateAnimationState,
    onResetAnimation: () => {
      handleResetAnimation();
      clearStyles();
    },
  });

  // This component doesn't render anything visible
  return null;
}

function useAnimationController() {
  const [controllerState, setControllerState] =
    useState<AnimationControllerState>(createAnimationControllerState);

  const handleStartAnimation = useCallback((message: StartAnimationMessage) => {
    setControllerState((prev) => startAnimation(prev, message.animationState));
  }, []);

  const handleStopAnimation = useCallback(() => {
    setControllerState((prev) => stopAnimation(prev));
  }, []);

  const handleUpdateAnimationState = useCallback(
    (message: UpdateAnimationStateMessage) => {
      setControllerState((prev) =>
        updateAnimationState(prev, message.animationState),
      );
    },
    [],
  );

  const handleResetAnimation = useCallback(() => {
    setControllerState(resetAnimation());
  }, []);

  return {
    controllerState,
    setControllerState,
    handleStartAnimation,
    handleStopAnimation,
    handleUpdateAnimationState,
    handleResetAnimation,
  };
}
