import type {
  AnimationState,
  InterpolationType,
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

function getInterpolationTypeAtTime({
  keyframes,
  time,
}: {
  keyframes: AnimationState["keyframes"];
  time: number;
}): InterpolationType {
  // Find the interpolationType from any field's keyframe at this exact time
  // If multiple fields have keyframes at this time, we use the first one found
  // (in practice, they should all have the same interpolationType if set at the same time)
  for (const fieldKeyframes of Object.values(keyframes)) {
    const keyframe = fieldKeyframes.find((kf) => kf.time === time);
    if (keyframe) {
      return keyframe.interpolationType;
    }
  }
  return "linear";
}

function generateKeyframeSteps(animationState: AnimationState): Array<{
  time: number;
  transform: string;
  transformOrigin: string;
  interpolationType: InterpolationType;
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
      interpolationType: getInterpolationTypeAtTime({
        keyframes: animationState.keyframes,
        time,
      }),
    };
  });
}

const ANIMATION_NAME = "transf-animation";

function generateCSSKeyframes(animationState: AnimationState) {
  const steps = generateKeyframeSteps(animationState);
  const keyframeRules = steps
    .map((step) => {
      const percentage = Math.round(step.time * 100);
      const timingFunction =
        percentage === 100
          ? ""
          : `\n    animation-timing-function: ${step.interpolationType};`;
      return `  ${percentage}% {
    transform: ${step.transform};
    transform-origin: ${step.transformOrigin};${timingFunction}
  }`;
    })
    .join("\n");

  return {
    keyframes: `@keyframes ${ANIMATION_NAME} {
${keyframeRules}
}`,
    animation: `${ANIMATION_NAME} ${animationState.duration}ms linear infinite ${animationState.isPlaying ? "running" : "paused"}`,
  };
}

export function generateAnimationStyles(state: AnimationState): string {
  if (hasKeyframes(state.keyframes)) {
    const config = generateCSSKeyframes(state);
    const delay = -state.currentTime * state.duration;

    return `
${config.keyframes}
html {
  animation: ${config.animation} !important;
  animation-delay: ${delay}ms !important;
}`;
  }

  return `
html {
  transform-origin: ${state.baseTransform.centerX}% ${state.baseTransform.centerY}%;
  transform: ${formatTransform(state.baseTransform)};
  transition: transform 0.3s ease;
}`;
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
