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

export function useAnimationController() {
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
