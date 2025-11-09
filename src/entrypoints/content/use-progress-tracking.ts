import { useEffect, useEffectEvent } from "react";
import type { AnimationState } from "@/src/entrypoints/popup/keyframe";
import { updateCurrentTime } from "@/src/feature/animation-controller";
import { sendAnimationProgressMessage } from "@/src/feature/message/animation-progress";

export function useProgressTracking(
  animationState: AnimationState | null,
  setAnimationState: React.Dispatch<
    React.SetStateAction<AnimationState | null>
  >,
) {
  const trackProgress = useEffectEvent(async () => {
    const updatedState = updateCurrentTime(animationState);
    const currentTime = updatedState?.currentTime ?? 0;
    const animationName = updatedState?.animationName ?? undefined;

    await sendAnimationProgressMessage(
      currentTime,
      updatedState?.isPlaying ?? false,
      animationName,
    );

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
