import type { AnimationState } from "@/src/feature/animation-state";
import { interpolateKeyframes } from "@/src/feature/keyframe";

function formatTransformValue(
  _centerX: number,
  _centerY: number,
  rotation: number,
  scale: number,
  translateX: number,
  translateY: number,
  flipHorizontal: boolean,
  flipVertical: boolean,
): string {
  const scaleX = flipHorizontal ? -scale : scale;
  const scaleY = flipVertical ? -scale : scale;

  return `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`;
}

function generateKeyframeSteps(animationState: AnimationState): Array<{
  time: number;
  transform: string;
  transformOrigin: string;
}> {
  const allTimes = new Set<number>();

  for (const keyframes of Object.values(animationState.keyframes)) {
    for (const kf of keyframes) {
      allTimes.add(kf.time);
    }
  }

  allTimes.add(0);
  allTimes.add(1);

  const sortedTimes = Array.from(allTimes).sort((a, b) => a - b);

  return sortedTimes.map((time) => {
    const centerX = interpolateKeyframes({
      keyframes: animationState.keyframes.centerX,
      time,
      defaultValue: animationState.baseTransform.centerX,
    });

    const centerY = interpolateKeyframes({
      keyframes: animationState.keyframes.centerY,
      time,
      defaultValue: animationState.baseTransform.centerY,
    });

    const rotation = interpolateKeyframes({
      keyframes: animationState.keyframes.rotation,
      time,
      defaultValue: animationState.baseTransform.rotation,
    });

    const scale = interpolateKeyframes({
      keyframes: animationState.keyframes.scale,
      time,
      defaultValue: animationState.baseTransform.scale,
    });

    const translateX = interpolateKeyframes({
      keyframes: animationState.keyframes.translateX,
      time,
      defaultValue: animationState.baseTransform.translateX,
    });

    const translateY = interpolateKeyframes({
      keyframes: animationState.keyframes.translateY,
      time,
      defaultValue: animationState.baseTransform.translateY,
    });

    const flipHorizontal =
      interpolateKeyframes({
        keyframes: animationState.keyframes.flipHorizontal,
        time,
        defaultValue: animationState.baseTransform.flipHorizontal ? 1 : 0,
      }) > 0.5;

    const flipVertical =
      interpolateKeyframes({
        keyframes: animationState.keyframes.flipVertical,
        time,
        defaultValue: animationState.baseTransform.flipVertical ? 1 : 0,
      }) > 0.5;

    return {
      time,
      transform: formatTransformValue(
        centerX,
        centerY,
        rotation,
        scale,
        translateX,
        translateY,
        flipHorizontal,
        flipVertical,
      ),
      transformOrigin: `${centerX}% ${centerY}%`,
    };
  });
}

const ANIMATION_NAME = "transf-animation";

function generateCSSKeyframes(animationState: AnimationState) {
  const keyframeSteps = generateKeyframeSteps(animationState);

  const keyframeRules = keyframeSteps
    .map((step) => {
      const percentage = Math.round(step.time * 100);
      return `  ${percentage}% {
    transform: ${step.transform};
    transform-origin: ${step.transformOrigin};
  }`;
    })
    .join("\n");

  const keyframesRule = `@keyframes ${ANIMATION_NAME} {
${keyframeRules}
}`;

  const duration = `${animationState.duration}ms`;
  const playState = animationState.isPlaying ? "running" : "paused";
  const animationProperty = `${ANIMATION_NAME} ${duration} linear infinite ${playState}`;

  return {
    keyframesRule,
    animationProperty,
  };
}

function generateStaticTransformCSS(animationState: AnimationState): string {
  const currentTransform = formatTransformValue(
    animationState.baseTransform.centerX,
    animationState.baseTransform.centerY,
    animationState.baseTransform.rotation,
    animationState.baseTransform.scale,
    animationState.baseTransform.translateX,
    animationState.baseTransform.translateY,
    animationState.baseTransform.flipHorizontal,
    animationState.baseTransform.flipVertical,
  );

  return `
transform-origin: ${animationState.baseTransform.centerX}% ${animationState.baseTransform.centerY}%;
transform: ${currentTransform};
transition: transform 0.3s ease;
`;
}

function hasKeyframes(animationState: AnimationState): boolean {
  return Object.values(animationState.keyframes).some(
    (keyframes) => keyframes.length > 0,
  );
}

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

  return (ms % duration) / duration;
}
