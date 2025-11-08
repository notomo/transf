import type { AnimationState } from "@/src/entrypoints/popup/keyframe";
import {
  type CSSAnimationConfig,
  generateCSSKeyframes,
  generateStaticTransformCSS,
  hasKeyframes,
} from "@/src/feature/css-keyframe";

export interface AnimationControllerState {
  currentAnimationConfig: CSSAnimationConfig | null;
  currentAnimationState: AnimationState | null;
  animationStartTime: number;
}

export function createAnimationControllerState(): AnimationControllerState {
  return {
    currentAnimationConfig: null,
    currentAnimationState: null,
    animationStartTime: 0,
  };
}

export function startAnimation(
  state: AnimationControllerState,
  animationState: AnimationState,
): AnimationControllerState {
  const animationName =
    state.currentAnimationState?.animationName ||
    animationState.animationName ||
    `transf-animation-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

  return {
    ...state,
    currentAnimationState: {
      ...animationState,
      animationName,
    },
    animationStartTime:
      Date.now() - animationState.currentTime * animationState.duration,
  };
}

export function stopAnimation(
  state: AnimationControllerState,
): AnimationControllerState {
  if (!state.currentAnimationState) {
    return state;
  }

  return {
    ...state,
    currentAnimationState: {
      ...state.currentAnimationState,
      isPlaying: false,
    },
  };
}

export function updateAnimationState(
  state: AnimationControllerState,
  animationState: AnimationState,
): AnimationControllerState {
  const animationName =
    state.currentAnimationState?.animationName ||
    animationState.animationName ||
    `transf-animation-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

  return {
    ...state,
    currentAnimationState: {
      ...animationState,
      animationName,
    },
    animationStartTime:
      Date.now() - animationState.currentTime * animationState.duration,
  };
}

export function resetAnimation(): AnimationControllerState {
  return createAnimationControllerState();
}

export function generateAnimationStyles(state: AnimationControllerState): {
  styles: string;
  config: CSSAnimationConfig | null;
} {
  if (!state.currentAnimationState) {
    return { styles: "", config: null };
  }

  if (hasKeyframes(state.currentAnimationState)) {
    const config = generateCSSKeyframes(state.currentAnimationState);
    const delay =
      -state.currentAnimationState.currentTime *
      state.currentAnimationState.duration;

    const styles = `
      ${config.keyframesRule}

      html {
        animation: ${config.animationProperty} !important;
        animation-delay: ${delay}ms !important;
      }
    `;

    return { styles, config };
  }

  const staticCSS = generateStaticTransformCSS(state.currentAnimationState);
  const styles = `
    html {
      ${staticCSS}
    }
  `;

  return { styles, config: null };
}

export function calculateCurrentTime(state: AnimationControllerState): number {
  if (!state.currentAnimationState?.isPlaying) {
    return state.currentAnimationState?.currentTime || 0;
  }

  const animationName = state.currentAnimationState.animationName;

  if (!animationName) {
    return state.currentAnimationState.currentTime;
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

  const duration = state.currentAnimationState.duration;
  // Convert to relative time (0.0-1.0) and handle looping
  return ((currentTimeMs as number) % duration) / duration;
}

export function updateCurrentTime(
  state: AnimationControllerState,
): AnimationControllerState {
  if (!state.currentAnimationState) {
    return state;
  }

  const currentTime = calculateCurrentTime(state);
  return {
    ...state,
    currentAnimationState: {
      ...state.currentAnimationState,
      currentTime,
    },
  };
}
