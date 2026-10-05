import { createPortal } from "react-dom";
import { generateAnimationStyles } from "@/src/feature/animation-css";
import type { AnimationState } from "@/src/feature/animation-state";

// Disables transition while dragging so that the page follows the pointer immediately.
const DRAGGING_STYLE = `
html {
  transition: none !important;
}`;

export function HeadStyle({
  animationState,
  isDragging,
}: {
  animationState: AnimationState | null;
  isDragging: boolean;
}) {
  if (animationState === null) {
    return null;
  }

  return createPortal(
    <style id="transf-animation-styles">
      {generateAnimationStyles(animationState)}
      {isDragging ? DRAGGING_STYLE : ""}
    </style>,
    document.head,
  );
}
