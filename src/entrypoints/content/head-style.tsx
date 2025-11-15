import { createPortal } from "react-dom";
import { generateAnimationStyles } from "@/src/feature/animation-css";
import type { AnimationState } from "@/src/feature/animation-state";

export function HeadStyle({
  animationState,
}: {
  animationState: AnimationState | null;
}) {
  if (animationState === null) {
    return null;
  }

  return createPortal(
    <style id="transf-animation-styles">
      {generateAnimationStyles(animationState)}
    </style>,
    document.head,
  );
}
