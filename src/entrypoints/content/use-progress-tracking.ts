import { useEffect, useEffectEvent } from "react";
import { updateCurrentTime } from "@/src/feature/animation-controller";
import type { AnimationState } from "@/src/feature/animation-state";
import { sendUpdateAnimationStateMessage } from "@/src/feature/message/update-animation-state";

export function useProgressTracking(
  animationState: AnimationState | null,
  setAnimationState: React.Dispatch<
    React.SetStateAction<AnimationState | null>
  >,
) {
  const trackProgress = useEffectEvent(async () => {
    const updatedState = updateCurrentTime(animationState);
    const currentTime = updatedState?.currentTime ?? 0;

    await sendUpdateAnimationStateMessage({ currentTime }, false);

    setAnimationState(updatedState);
  });

  const isPlaying = animationState?.isPlaying ?? false;

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
