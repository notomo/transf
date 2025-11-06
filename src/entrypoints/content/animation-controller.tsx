import { useAnimationController } from "./use-animation-controller";
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
