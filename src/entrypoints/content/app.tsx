import { useState } from "react";
import type { AnimationState } from "@/src/feature/animation-state";
import { useGizmoEnabled } from "@/src/feature/gizmo-setting";
import { Gizmo } from "./gizmo/gizmo";
import { HeadStyle } from "./head-style";
import { useCurrentTimeUpdater } from "./use-current-time-updater";
import { useMessageHandler } from "./use-message-handler";

export function App() {
  const [animationState, setAnimationState] = useState<AnimationState | null>(
    null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const gizmoEnabled = useGizmoEnabled();

  useCurrentTimeUpdater({ animationState });

  useMessageHandler({ setAnimationState });

  return (
    <>
      <HeadStyle animationState={animationState} isDragging={isDragging} />
      {animationState !== null &&
      !animationState.isPlaying &&
      gizmoEnabled === true ? (
        <Gizmo
          animationState={animationState}
          setAnimationState={setAnimationState}
          setIsDragging={setIsDragging}
        />
      ) : null}
    </>
  );
}
