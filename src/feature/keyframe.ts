import type {
  AnimationKeyframes,
  AnimationState,
  InterpolationType,
  Keyframe,
  KeyframeValue,
  RelativeTime,
  TransformState,
} from "@/src/feature/animation-state";
import { keyframeFieldNames } from "@/src/feature/animation-state";

function toNumericValue(value: KeyframeValue) {
  return typeof value === "boolean" ? (value ? 1 : 0) : value;
}

export function interpolateKeyframes({
  keyframes,
  time,
  defaultValue,
}: {
  keyframes: Keyframe[];
  time: RelativeTime;
  defaultValue: KeyframeValue;
}): number {
  if (keyframes.length === 0) {
    return toNumericValue(defaultValue);
  }

  const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);
  const firstKeyframe = sortedKeyframes[0];
  const lastKeyframe = sortedKeyframes[sortedKeyframes.length - 1];

  if (!firstKeyframe || !lastKeyframe) {
    return toNumericValue(defaultValue);
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

  return toNumericValue(defaultValue);
}

export function getAllKeyframeTimeSet(
  keyframes: AnimationKeyframes,
): Set<number> {
  const times = new Set<number>();
  for (const kfs of Object.values(keyframes)) {
    for (const kf of kfs) {
      times.add(kf.time);
    }
  }
  return times;
}

function getAllKeyframeTimes(keyframes: AnimationKeyframes): number[] {
  return Array.from(getAllKeyframeTimeSet(keyframes)).sort((a, b) => a - b);
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
  interpolationType = "linear",
}: {
  keyframes: Keyframe[];
  time: RelativeTime;
  value: KeyframeValue;
  interpolationType?: InterpolationType;
}): Keyframe[] {
  const newKeyframes = keyframes.filter((kf) => kf.time !== time);
  newKeyframes.push({ time, value: toNumericValue(value), interpolationType });
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
  value: KeyframeValue;
}): Keyframe[] {
  const keyframeIndex = keyframes.findIndex((kf) => kf.time === time);
  if (keyframeIndex === -1) {
    return keyframes;
  }

  const existingKeyframe = keyframes[keyframeIndex];
  if (!existingKeyframe) {
    return keyframes;
  }

  const newKeyframes = [...keyframes];
  newKeyframes[keyframeIndex] = {
    ...existingKeyframe,
    time,
    value: toNumericValue(value),
  };
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

    if (!hasKeyframeAtTime({ keyframes: fieldKeyframes, time: currentTime })) {
      updatedKeyframes[field] = addKeyframeTo({
        keyframes: fieldKeyframes,
        time: currentTime,
        value,
      });
    } else {
      updatedKeyframes[field] = updateKeyframe({
        keyframes: fieldKeyframes,
        time: currentTime,
        value,
      });
    }
  }
  return updatedKeyframes;
}

export function deriveTransformFromAnimationState({
  state,
  specifiedTime,
}: {
  state: AnimationState;
  specifiedTime?: number;
}): TransformState {
  const time = specifiedTime ?? state.currentTime;
  return {
    rotation: interpolateKeyframes({
      keyframes: state.keyframes.rotation,
      time,
      defaultValue: state.baseTransform.rotation,
    }),
    scale: interpolateKeyframes({
      keyframes: state.keyframes.scale,
      time,
      defaultValue: state.baseTransform.scale,
    }),
    translateX: interpolateKeyframes({
      keyframes: state.keyframes.translateX,
      time,
      defaultValue: state.baseTransform.translateX,
    }),
    translateY: interpolateKeyframes({
      keyframes: state.keyframes.translateY,
      time,
      defaultValue: state.baseTransform.translateY,
    }),
    centerX: interpolateKeyframes({
      keyframes: state.keyframes.centerX,
      time,
      defaultValue: state.baseTransform.centerX,
    }),
    centerY: interpolateKeyframes({
      keyframes: state.keyframes.centerY,
      time,
      defaultValue: state.baseTransform.centerY,
    }),
    flipHorizontal:
      interpolateKeyframes({
        keyframes: state.keyframes.flipHorizontal,
        time,
        defaultValue: state.baseTransform.flipHorizontal,
      }) > 0.5,
    flipVertical:
      interpolateKeyframes({
        keyframes: state.keyframes.flipVertical,
        time,
        defaultValue: state.baseTransform.flipVertical,
      }) > 0.5,
  };
}

export function hasKeyframes(keyframes: AnimationKeyframes): boolean {
  return Object.values(keyframes).some((keyframes) => keyframes.length > 0);
}

const MIN_KEYFRAME_DISTANCE = 0.02;

function findNearestKeyframeTime({
  keyframes,
  time,
  excludeTime,
}: {
  keyframes: Keyframe[];
  time: RelativeTime;
  excludeTime?: RelativeTime;
}): number | undefined {
  let nearestTime: number | undefined;
  let minDistance = Number.POSITIVE_INFINITY;

  for (const kf of keyframes) {
    if (excludeTime !== undefined && kf.time === excludeTime) {
      continue;
    }

    const distance = Math.abs(kf.time - time);
    if (distance < minDistance) {
      minDistance = distance;
      nearestTime = kf.time;
    }
  }

  return nearestTime;
}

function canMoveKeyframeTo({
  keyframes,
  fromTime,
  toTime,
}: {
  keyframes: Keyframe[];
  fromTime: RelativeTime;
  toTime: RelativeTime;
}): boolean {
  if (toTime < 0 || toTime > 1) {
    return false;
  }

  const nearestTime = findNearestKeyframeTime({
    keyframes,
    time: toTime,
    excludeTime: fromTime,
  });

  if (nearestTime !== undefined) {
    const distance = Math.abs(toTime - nearestTime);
    if (distance < MIN_KEYFRAME_DISTANCE) {
      return false;
    }
  }

  return true;
}

export function moveKeyframe({
  keyframes,
  fromTime,
  toTime,
}: {
  keyframes: Keyframe[];
  fromTime: RelativeTime;
  toTime: RelativeTime;
}): Keyframe[] {
  const keyframe = keyframes.find((kf) => kf.time === fromTime);
  if (!keyframe) {
    return keyframes;
  }

  if (!canMoveKeyframeTo({ keyframes, fromTime, toTime })) {
    return keyframes;
  }

  const withoutOld = keyframes.filter((kf) => kf.time !== fromTime);
  return [
    ...withoutOld,
    {
      time: toTime,
      value: keyframe.value,
      interpolationType: keyframe.interpolationType,
    },
  ];
}

export function updateInterpolationType({
  keyframes,
  time,
  interpolationType,
}: {
  keyframes: Keyframe[];
  time: RelativeTime;
  interpolationType: InterpolationType;
}): Keyframe[] {
  const keyframeIndex = keyframes.findIndex((kf) => kf.time === time);
  if (keyframeIndex === -1) {
    return keyframes;
  }

  const existingKeyframe = keyframes[keyframeIndex];
  if (!existingKeyframe) {
    return keyframes;
  }

  const newKeyframes = [...keyframes];
  newKeyframes[keyframeIndex] = {
    ...existingKeyframe,
    interpolationType,
  };
  return newKeyframes;
}
