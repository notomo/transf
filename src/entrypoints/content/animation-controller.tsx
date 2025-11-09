import { useCallback, useState } from "react";
import type { AnimationState } from "@/src/entrypoints/popup/keyframe";
import type { StartAnimationMessage } from "@/src/feature/message/start-animation";
import type { StopAnimationMessage } from "@/src/feature/message/stop-animation";
import type { UpdateAnimationStateMessage } from "@/src/feature/message/update-animation-state";
import { useMessageHandler } from "./use-message-handler";
import { useProgressTracking } from "./use-progress-tracking";
import { useStyleInjection } from "./use-style-injection";

export function AnimationController() {
  const {
    animationState,
    setAnimationState,
    handleStartAnimation,
    handleStopAnimation,
    handleUpdateAnimationState,
    handleResetAnimation,
  } = useAnimationController();

  const { clearStyles } = useStyleInjection(animationState);

  useProgressTracking(animationState, setAnimationState);

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
  const [animationState, setAnimationState] = useState<AnimationState | null>(
    null,
  );

  const handleStartAnimation = useCallback((message: StartAnimationMessage) => {
    setAnimationState(message.animationState);
  }, []);

  const handleStopAnimation = useCallback((message: StopAnimationMessage) => {
    setAnimationState(message.animationState);
  }, []);

  const handleUpdateAnimationState = useCallback(
    (message: UpdateAnimationStateMessage) => {
      setAnimationState(message.animationState);
    },
    [],
  );

  const handleResetAnimation = useCallback(() => {
    setAnimationState(null);
  }, []);

  return {
    animationState,
    setAnimationState,
    handleStartAnimation,
    handleStopAnimation,
    handleUpdateAnimationState,
    handleResetAnimation,
  };
}
