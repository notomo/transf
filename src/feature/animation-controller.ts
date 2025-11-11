import type { AnimationState } from "@/src/feature/animation-state";
import { ANIMATION_NAME } from "@/src/feature/animation-state";
import {
  generateCSSKeyframes,
  generateStaticTransformCSS,
  hasKeyframes,
} from "@/src/feature/css-keyframe";

export function generateAnimationStyles(state: AnimationState | null): string {
  if (!state) {
    return "";
  }

  if (hasKeyframes(state)) {
    const config = generateCSSKeyframes(state);
    const delay = -state.currentTime * state.duration;

    return `
      ${config.keyframesRule}

      html {
        animation: ${config.animationProperty} !important;
        animation-delay: ${delay}ms !important;
      }
    `;
  }

  const staticCSS = generateStaticTransformCSS(state);
  return `
    html {
      ${staticCSS}
    }
  `;
}

export function calculateCurrentTime(duration: number): number {
  const animation = document.documentElement
    .getAnimations()
    .find(
      (x) => x instanceof CSSAnimation && x.animationName === ANIMATION_NAME,
    );
  if (!animation) {
    throw new Error(`CSS Animation with name "${ANIMATION_NAME}" not found`);
  }

  const ms = Number(animation.currentTime ?? 0);

  // Convert to relative time (0.0-1.0) and handle looping
  return (ms % duration) / duration;
}
