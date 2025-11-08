import { useEffect, useEffectEvent } from "react";
import type { AnimationControllerState } from "@/src/feature/animation-controller";
import { updateCurrentTime } from "@/src/feature/animation-controller";
import { sendAnimationProgressMessage } from "@/src/feature/message/animation-progress";

export function useProgressTracking(
  controllerState: AnimationControllerState,
  setControllerState: React.Dispatch<
    React.SetStateAction<AnimationControllerState>
  >,
) {
  const trackProgress = useEffectEvent(async () => {
    const updatedState = updateCurrentTime(controllerState);
    const currentTime = updatedState.currentAnimationState?.currentTime ?? 0;
    const animationName =
      updatedState.currentAnimationState?.animationName ?? undefined;

    await sendAnimationProgressMessage(
      currentTime,
      updatedState.currentAnimationState?.isPlaying ?? false,
      animationName,
    );

    setControllerState(updatedState);
  });

  const isPlaying = controllerState.currentAnimationState?.isPlaying ?? false;

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const intervalId = window.setInterval(trackProgress, 50);
    return () => {
      clearInterval(intervalId);
    };
  }, [isPlaying]);
}
