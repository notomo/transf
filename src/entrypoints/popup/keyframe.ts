export type Keyframe = {
  time: number;
  value: number;
};

export const keyframeFieldNames = [
  "rotation",
  "scale",
  "translateX",
  "translateY",
] as const;

export type KeyframeFieldName = (typeof keyframeFieldNames)[number];

export type AnimationKeyframes = Record<KeyframeFieldName, Keyframe[]>;

export type AnimationState = {
  keyframes: AnimationKeyframes;
  duration: number;
  isPlaying: boolean;
  currentTime: number;
};

export function interpolateKeyframes(
  keyframes: Keyframe[],
  time: number,
  defaultValue: number,
): number {
  if (keyframes.length === 0) {
    return defaultValue;
  }

  const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);
  const firstKeyframe = sortedKeyframes[0];
  const lastKeyframe = sortedKeyframes[sortedKeyframes.length - 1];

  if (!firstKeyframe || !lastKeyframe) {
    return defaultValue;
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

export function findPreviousKeyframeTime(
  keyframes: AnimationKeyframes,
  currentTime: number,
): number | undefined {
  const allTimes = getAllKeyframeTimes(keyframes);
  return allTimes.filter((t) => t < currentTime).pop();
}

export function findNextKeyframeTime(
  keyframes: AnimationKeyframes,
  currentTime: number,
): number | undefined {
  const allTimes = getAllKeyframeTimes(keyframes);
  return allTimes.find((t) => t > currentTime);
}

export function hasKeyframeAtTime(
  keyframes: Keyframe[],
  time: number,
): boolean {
  return keyframes.some((kf) => kf.time === time);
}

export function addKeyframeTo(
  keyframes: Keyframe[],
  time: number,
  value: number,
): Keyframe[] {
  const newKeyframes = keyframes.filter((kf) => kf.time !== time);
  newKeyframes.push({ time, value });
  return newKeyframes;
}

export function removeKeyframeFrom(
  keyframes: Keyframe[],
  time: number,
): Keyframe[] {
  return keyframes.filter((kf) => kf.time !== time);
}

export function updateKeyframe(
  keyframes: Keyframe[],
  time: number,
  value: number,
): Keyframe[] {
  const keyframeIndex = keyframes.findIndex((kf) => kf.time === time);
  if (keyframeIndex === -1) {
    return keyframes;
  }

  const newKeyframes = [...keyframes];
  newKeyframes[keyframeIndex] = { time, value };
  return newKeyframes;
}
