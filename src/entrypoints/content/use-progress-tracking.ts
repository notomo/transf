import { useEffect, useEffectEvent } from "react";
import type { AnimationControllerState } from "@/src/feature/animation-controller";
import {
  calculateCurrentTime,
  updateCurrentTime,
} from "@/src/feature/animation-controller";
import { sendAnimationProgressMessage } from "@/src/feature/message/animation-progress";

export function useProgressTracking(
  isPlaying: boolean,
  setControllerState: React.Dispatch<
    React.SetStateAction<AnimationControllerState>
  >,
) {
  const trackProgress = useEffectEvent(() => {
    setControllerState((prevState) => {
      const updatedState = updateCurrentTime(prevState);
      const currentTime = calculateCurrentTime(updatedState);

      sendAnimationProgressMessage(
        currentTime,
        updatedState.currentAnimationState?.isPlaying ?? false,
      );

      return updatedState;
    });
  });

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
