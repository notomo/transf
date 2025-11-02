import { useCallback, useEffect, useRef } from "react";
import { browser } from "wxt/browser";
import type { AnimationControllerState } from "@/src/feature/animation-controller";
import {
  calculateCurrentTime,
  updateCurrentTime,
} from "@/src/feature/animation-controller";
import { createAnimationProgressMessage } from "@/src/feature/message";

export function useProgressTracking(
  controllerState: AnimationControllerState,
  setControllerState: React.Dispatch<
    React.SetStateAction<AnimationControllerState>
  >,
) {
  const progressIntervalRef = useRef<number | null>(null);

  const startProgressTracking = useCallback(() => {
    // Stop any existing tracking
    if (progressIntervalRef.current !== null) {
      clearTimeout(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (!controllerState.currentAnimationState?.isPlaying) {
      return;
    }

    const trackProgress = () => {
      if (!controllerState.currentAnimationState?.isPlaying) {
        return;
      }

      setControllerState((prevState) => {
        const updatedState = updateCurrentTime(prevState);
        const currentTime = calculateCurrentTime(updatedState);

        browser.runtime.sendMessage(
          createAnimationProgressMessage(
            currentTime,
            updatedState.currentAnimationState?.isPlaying ?? false,
          ),
        );

        return updatedState;
      });

      progressIntervalRef.current = window.setTimeout(trackProgress, 50);
    };

    progressIntervalRef.current = window.setTimeout(trackProgress, 50);
  }, [controllerState.currentAnimationState?.isPlaying, setControllerState]);

  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current !== null) {
      clearTimeout(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Effect to handle automatic tracking based on animation state
  useEffect(() => {
    if (controllerState.currentAnimationState?.isPlaying) {
      startProgressTracking();
    } else {
      stopProgressTracking();
    }

    return stopProgressTracking;
  }, [
    controllerState.currentAnimationState?.isPlaying,
    startProgressTracking,
    stopProgressTracking,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return stopProgressTracking;
  }, [stopProgressTracking]);

  return {
    startProgressTracking,
    stopProgressTracking,
  };
}
