import type { AnimationState } from "@/src/entrypoints/popup/keyframe";
import {
  type CSSAnimationConfig,
  generateCSSKeyframes,
  generateStaticTransformCSS,
  hasKeyframes,
} from "@/src/feature/css-keyframe";

export function generateAnimationStyles(state: AnimationState | null): {
  styles: string;
  config: CSSAnimationConfig | null;
} {
  if (!state) {
    return { styles: "", config: null };
  }

  if (hasKeyframes(state)) {
    const config = generateCSSKeyframes(state);
    const delay = -state.currentTime * state.duration;

    const styles = `
      ${config.keyframesRule}

      html {
        animation: ${config.animationProperty} !important;
        animation-delay: ${delay}ms !important;
      }
    `;

    return { styles, config };
  }

  const staticCSS = generateStaticTransformCSS(state);
  const styles = `
    html {
      ${staticCSS}
    }
  `;

  return { styles, config: null };
}

export function calculateCurrentTime(state: AnimationState | null): number {
  if (!state?.isPlaying) {
    return state?.currentTime || 0;
  }

  const animationName = state.animationName;

  if (!animationName) {
    return state.currentTime;
  }

  const animations = document.documentElement.getAnimations();
  const transformAnimation = animations.find(
    (anim) =>
      anim instanceof CSSAnimation && anim.animationName === animationName,
  );

  if (!transformAnimation) {
    throw new Error(`CSS Animation with name "${animationName}" not found`);
  }

  const currentTimeMs = transformAnimation.currentTime;
  if (currentTimeMs === null || currentTimeMs === undefined) {
    throw new Error("Animation currentTime is null or undefined");
  }

  const duration = state.duration;
  // Convert to relative time (0.0-1.0) and handle looping
  return ((currentTimeMs as number) % duration) / duration;
}

export function updateCurrentTime(
  state: AnimationState | null,
): AnimationState | null {
  if (!state) {
    return state;
  }

  const currentTime = calculateCurrentTime(state);
  return {
    ...state,
    currentTime,
  };
}
