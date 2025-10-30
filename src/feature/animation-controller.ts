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
  return {
    ...state,
    currentAnimationState: animationState,
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
  return {
    ...state,
    currentAnimationState: animationState,
    animationStartTime:
      Date.now() - animationState.currentTime * animationState.duration,
  };
}

export function resetAnimation(): AnimationControllerState {
  return createAnimationControllerState();
}

export function generateAnimationStyles(
  state: AnimationControllerState,
): string {
  if (!state.currentAnimationState) {
    return "";
  }

  if (hasKeyframes(state.currentAnimationState)) {
    const config = generateCSSKeyframes(state.currentAnimationState);
    const delay =
      -state.currentAnimationState.currentTime *
      state.currentAnimationState.duration;

    return `
      ${config.keyframesRule}
      
      html {
        animation: ${config.animationProperty} !important;
        animation-delay: ${delay}ms !important;
      }
    `;
  }

  const staticCSS = generateStaticTransformCSS(state.currentAnimationState);
  return `
    html {
      ${staticCSS}
    }
  `;
}

export function calculateCurrentTime(state: AnimationControllerState): number {
  if (!state.currentAnimationState?.isPlaying) {
    return state.currentAnimationState?.currentTime || 0;
  }

  const elapsed = Date.now() - state.animationStartTime;
  const duration = state.currentAnimationState.duration;
  return (elapsed % duration) / duration;
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
