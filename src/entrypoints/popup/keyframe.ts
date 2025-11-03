import type {
  AnimationKeyframes,
  AnimationState,
  Keyframe,
  KeyframeFieldName,
  RelativeTime,
  TransformState,
} from "@/src/feature/animation-state";
import {
  DEFAULT_ANIMATION,
  DEFAULT_TRANSFORM_VALUES,
  keyframeFieldLabels,
  keyframeFieldNames,
} from "@/src/feature/animation-state";

export type {
  RelativeTime,
  Keyframe,
  KeyframeFieldName,
  AnimationKeyframes,
  TransformState,
  AnimationState,
};
export {
  keyframeFieldNames,
  keyframeFieldLabels,
  DEFAULT_TRANSFORM_VALUES,
  DEFAULT_ANIMATION,
};

export function interpolateKeyframes({
  keyframes,
  time,
  defaultValue,
}: {
  keyframes: Keyframe[];
  time: RelativeTime;
  defaultValue: number;
}): number {
  if (keyframes.length === 0) {
    return defaultValue;
  }

  const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);
  const firstKeyframe = sortedKeyframes[0];
  const lastKeyframe = sortedKeyframes[sortedKeyframes.length - 1];

  if (!firstKeyframe || !lastKeyframe) {
    return defaultValue;
  }

  const exactMatch = sortedKeyframes.find((kf) => kf.time === time);
  if (exactMatch) {
    return exactMatch.value;
  }

  if (time <= firstKeyframe.time) {
    return firstKeyframe.value;
  }

  if (time >= lastKeyframe.time) {
    return lastKeyframe.value;
  }

  for (let i = 0; i < sortedKeyframes.length - 1; i++) {
    const current = sortedKeyframes[i];
    const next = sortedKeyframes[i + 1];

    if (!current || !next) {
      continue;
    }

    if (time >= current.time && time <= next.time) {
      const progress = (time - current.time) / (next.time - current.time);
      return current.value + (next.value - current.value) * progress;
    }
  }

  return defaultValue;
}

function getAllKeyframeTimes(keyframes: AnimationKeyframes): number[] {
  const times = new Set<number>();
  Object.values(keyframes).forEach((keyframes) => {
    for (const kf of keyframes) {
      times.add(kf.time);
    }
  });
  return Array.from(times).sort((a, b) => a - b);
}

export function findPreviousKeyframeTime({
  keyframes,
  currentTime,
}: {
  keyframes: AnimationKeyframes;
  currentTime: RelativeTime;
}): number | undefined {
  const allTimes = getAllKeyframeTimes(keyframes);
  const previousTime = allTimes.filter((t) => t < currentTime).pop();
  if (previousTime !== undefined) {
    return previousTime;
  }
  // Wrap around to the last keyframe if no previous keyframe exists
  return allTimes[allTimes.length - 1];
}

export function findNextKeyframeTime({
  keyframes,
  currentTime,
}: {
  keyframes: AnimationKeyframes;
  currentTime: RelativeTime;
}): number | undefined {
  const allTimes = getAllKeyframeTimes(keyframes);
  const nextTime = allTimes.find((t) => t > currentTime);
  if (nextTime !== undefined) {
    return nextTime;
  }
  // Wrap around to the first keyframe if no next keyframe exists
  return allTimes[0];
}

export function hasKeyframeAtTime({
  keyframes,
  time,
}: {
  keyframes: Keyframe[];
  time: RelativeTime;
}): boolean {
  return keyframes.some((kf) => kf.time === time);
}

export function addKeyframeTo({
  keyframes,
  time,
  value,
}: {
  keyframes: Keyframe[];
  time: RelativeTime;
  value: number;
}): Keyframe[] {
  const newKeyframes = keyframes.filter((kf) => kf.time !== time);
  newKeyframes.push({ time, value });
  return newKeyframes;
}

export function removeKeyframeFrom({
  keyframes,
  time,
}: {
  keyframes: Keyframe[];
  time: RelativeTime;
}): Keyframe[] {
  return keyframes.filter((kf) => kf.time !== time);
}

export function updateKeyframe({
  keyframes,
  time,
  value,
}: {
  keyframes: Keyframe[];
  time: RelativeTime;
  value: number;
}): Keyframe[] {
  const keyframeIndex = keyframes.findIndex((kf) => kf.time === time);
  if (keyframeIndex === -1) {
    return keyframes;
  }

  const newKeyframes = [...keyframes];
  newKeyframes[keyframeIndex] = { time, value };
  return newKeyframes;
}

export function updateKeyframesWithTransform({
  keyframes,
  updates,
  currentTime,
}: {
  keyframes: AnimationKeyframes;
  updates: Partial<TransformState>;
  currentTime: RelativeTime;
}): AnimationKeyframes {
  const updatedKeyframes = { ...keyframes };
  for (const field of keyframeFieldNames) {
    const value = updates[field];
    if (value === undefined) {
      continue;
    }

    const fieldKeyframes = updatedKeyframes[field];
    if (fieldKeyframes.length === 0) {
      continue;
    }

    const numericValue = typeof value === "boolean" ? (value ? 1 : 0) : value;
    if (!hasKeyframeAtTime({ keyframes: fieldKeyframes, time: currentTime })) {
      updatedKeyframes[field] = addKeyframeTo({
        keyframes: fieldKeyframes,
        time: currentTime,
        value: numericValue,
      });
    } else {
      updatedKeyframes[field] = updateKeyframe({
        keyframes: fieldKeyframes,
        time: currentTime,
        value: numericValue,
      });
    }
  }
  return updatedKeyframes;
}

export function deriveTransformFromAnimationState(
  state: AnimationState,
): TransformState {
  return {
    rotation: interpolateKeyframes({
      keyframes: state.keyframes.rotation,
      time: state.currentTime,
      defaultValue: state.baseTransform.rotation,
    }),
    scale: interpolateKeyframes({
      keyframes: state.keyframes.scale,
      time: state.currentTime,
      defaultValue: state.baseTransform.scale,
    }),
    translateX: interpolateKeyframes({
      keyframes: state.keyframes.translateX,
      time: state.currentTime,
      defaultValue: state.baseTransform.translateX,
    }),
    translateY: interpolateKeyframes({
      keyframes: state.keyframes.translateY,
      time: state.currentTime,
      defaultValue: state.baseTransform.translateY,
    }),
    centerX: interpolateKeyframes({
      keyframes: state.keyframes.centerX,
      time: state.currentTime,
      defaultValue: state.baseTransform.centerX,
    }),
    centerY: interpolateKeyframes({
      keyframes: state.keyframes.centerY,
      time: state.currentTime,
      defaultValue: state.baseTransform.centerY,
    }),
    flipHorizontal:
      interpolateKeyframes({
        keyframes: state.keyframes.flipHorizontal,
        time: state.currentTime,
        defaultValue: state.baseTransform.flipHorizontal ? 1 : 0,
      }) > 0.5,
    flipVertical:
      interpolateKeyframes({
        keyframes: state.keyframes.flipVertical,
        time: state.currentTime,
        defaultValue: state.baseTransform.flipVertical ? 1 : 0,
      }) > 0.5,
  };
}
