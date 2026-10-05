import { useState } from "react";
import {
  type AnimationState,
  DEFAULT_ANIMATION,
} from "@/src/feature/animation-state";
import { calculateViewportCenterOrigin } from "@/src/feature/gizmo-geometry";
import { useGizmoEnabled } from "@/src/feature/gizmo-setting";
import { Gizmo } from "./gizmo/gizmo";
import { readRootLayout } from "./gizmo/use-root-layout";
import { HeadStyle } from "./head-style";
import { useCurrentTimeUpdater } from "./use-current-time-updater";
import { useMessageHandler } from "./use-message-handler";

// Places the pivot at the current viewport center so that the gizmo is visible on long pages.
function createInitialAnimationState(): AnimationState {
  return {
    ...DEFAULT_ANIMATION,
    baseTransform: {
      ...DEFAULT_ANIMATION.baseTransform,
      ...calculateViewportCenterOrigin(readRootLayout()),
    },
  };
}

export function App() {
  const [animationState, setAnimationState] = useState<AnimationState | null>(
    null,
  );
  // Used to show the gizmo before any transform is saved. Not null after requested by the popup.
  const [initialAnimationState, setInitialAnimationState] =
    useState<AnimationState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const gizmoEnabled = useGizmoEnabled();

  useCurrentTimeUpdater({ animationState });

  useMessageHandler({
    setAnimationState,
    showGizmo: () => {
      const state = createInitialAnimationState();
      setInitialAnimationState(state);
      return state;
    },
  });

  const gizmoAnimationState = animationState ?? initialAnimationState;

  return (
    <>
      <HeadStyle animationState={animationState} isDragging={isDragging} />
      {gizmoAnimationState !== null &&
      !gizmoAnimationState.isPlaying &&
      gizmoEnabled === true ? (
        <Gizmo
          animationState={gizmoAnimationState}
          setAnimationState={(state) => {
            // Cancelling a drag started from the initial state restores no transform.
            setAnimationState(state === initialAnimationState ? null : state);
          }}
          setIsDragging={setIsDragging}
        />
      ) : null}
    </>
  );
}
