import { useEffect, useEffectEvent } from "react";
import { calculateCurrentTime } from "@/src/feature/animation-css";
import type { AnimationState } from "@/src/feature/animation-state";
import { sendUpdateAnimationStateMessage } from "@/src/feature/message/update-animation-state";

export function useCurrentTimeUpdater(
  animationState: AnimationState | null,
  setAnimationState: (state: AnimationState) => void,
) {
  const update = useEffectEvent(async () => {
    if (!animationState) {
      return;
    }
    const currentTime = calculateCurrentTime(animationState.duration);

    await sendUpdateAnimationStateMessage({ currentTime }, false);

    setAnimationState({
      ...animationState,
      currentTime,
    });
  });

  const isPlaying = animationState?.isPlaying ?? false;

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const intervalId = window.setInterval(update, 50);
    return () => {
      clearInterval(intervalId);
    };
  }, [isPlaying]);
}
