import type {
  AnimationState,
  TransformState,
} from "@/src/feature/animation-state";
import {
  deriveTransformFromAnimationState,
  getAllKeyframeTimeSet,
  hasKeyframes,
} from "@/src/feature/keyframe";

function formatTransform({
  rotation,
  scale,
  translateX,
  translateY,
  flipHorizontal,
  flipVertical,
}: TransformState): string {
  const scaleX = flipHorizontal ? -scale : scale;
  const scaleY = flipVertical ? -scale : scale;
  return `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`;
}

function generateKeyframeSteps(animationState: AnimationState): Array<{
  time: number;
  transform: string;
  transformOrigin: string;
}> {
  const timeSet = getAllKeyframeTimeSet(animationState.keyframes);
  timeSet.add(0);
  timeSet.add(1);
  const allTimes = Array.from(timeSet).sort((a, b) => a - b);
  return allTimes.map((time) => {
    const transformState = deriveTransformFromAnimationState({
      state: animationState,
      specifiedTime: time,
    });
    return {
      time,
      transform: formatTransform(transformState),
      transformOrigin: `${transformState.centerX}% ${transformState.centerY}%`,
    };
  });
}

const ANIMATION_NAME = "transf-animation";

function generateCSSKeyframes(animationState: AnimationState) {
  const keyframeRules = generateKeyframeSteps(animationState)
    .map((step) => {
      const percentage = Math.round(step.time * 100);
      return `  ${percentage}% {
    transform: ${step.transform};
    transform-origin: ${step.transformOrigin};
  }`;
    })
    .join("\n");

  return {
    keyframesRule: `@keyframes ${ANIMATION_NAME} {
${keyframeRules}
}`,
    animationProperty: `${ANIMATION_NAME} ${animationState.duration}ms linear infinite ${animationState.isPlaying ? "running" : "paused"}`,
  };
}

function generateStaticTransformCSS(animationState: AnimationState): string {
  return `
transform-origin: ${animationState.baseTransform.centerX}% ${animationState.baseTransform.centerY}%;
transform: ${formatTransform(animationState.baseTransform)};
transition: transform 0.3s ease;
`;
}

export function generateAnimationStyles(state: AnimationState | null): string {
  if (!state) {
    return "";
  }

  if (hasKeyframes(state.keyframes)) {
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

  return (ms % duration) / duration;
}
