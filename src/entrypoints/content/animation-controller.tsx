import { useCallback, useState } from "react";
import type { AnimationState } from "@/src/feature/animation-state";
import { useMessageHandler } from "./use-message-handler";
import { useProgressTracking } from "./use-progress-tracking";
import { useStyleInjection } from "./use-style-injection";

export function AnimationController() {
  const [animationState, setAnimationState] = useState<AnimationState | null>(
    null,
  );

  const { clearStyles } = useStyleInjection(animationState);

  useProgressTracking(animationState, setAnimationState);

  const onUpdateState = useCallback(
    (state: AnimationState | null) => {
      setAnimationState(state);
      if (state === null) {
        clearStyles();
      }
    },
    [clearStyles],
  );

  useMessageHandler({
    onUpdateState,
  });

  // This component doesn't render anything visible
  return null;
}
