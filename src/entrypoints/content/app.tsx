import { useCallback, useState } from "react";
import type { AnimationState } from "@/src/feature/animation-state";
import { useCurrentTimeUpdater } from "./use-current-time-updater";
import { useMessageHandler } from "./use-message-handler";
import { useStyleInjection } from "./use-style-injection";

export function App() {
  const [animationState, setAnimationState] = useState<AnimationState | null>(
    null,
  );

  useCurrentTimeUpdater(animationState, setAnimationState);

  const { clearStyles } = useStyleInjection(animationState);

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
