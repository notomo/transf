export type Keyframe = {
  time: number;
  value: number;
};

export const keyframeFieldNames = [
  "rotation",
  "scale",
  "translateX",
  "translateY",
  "centerX",
  "centerY",
  "flipHorizontal",
  "flipVertical",
] as const;

export type KeyframeFieldName = (typeof keyframeFieldNames)[number];

export const keyframeFieldLabels = {
  rotation: "Rotation",
  scale: "Scale",
  translateX: "Translate X",
  translateY: "Translate Y",
  centerX: "Center X",
  centerY: "Center Y",
  flipHorizontal: "Horizontal Flip",
  flipVertical: "Vertical Flip",
} as const satisfies Record<KeyframeFieldName, string>;

export type AnimationKeyframes = Record<KeyframeFieldName, Keyframe[]>;

export type TransformState = {
  centerX: number;
  centerY: number;
  rotation: number;
  scale: number;
  translateX: number;
  translateY: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
};

export type AnimationState = {
  keyframes: AnimationKeyframes;
  duration: number;
  isPlaying: boolean;
  currentTime: number;
  baseTransform: TransformState;
};

export function interpolateKeyframes({
  keyframes,
  time,
  defaultValue,
}: {
  keyframes: Keyframe[];
  time: number;
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
  currentTime: number;
}): number | undefined {
  const allTimes = getAllKeyframeTimes(keyframes);
  return allTimes.filter((t) => t < currentTime).pop();
}

export function findNextKeyframeTime({
  keyframes,
  currentTime,
}: {
  keyframes: AnimationKeyframes;
  currentTime: number;
}): number | undefined {
  const allTimes = getAllKeyframeTimes(keyframes);
  return allTimes.find((t) => t > currentTime);
}

export function hasKeyframeAtTime({
  keyframes,
  time,
}: {
  keyframes: Keyframe[];
  time: number;
}): boolean {
  return keyframes.some((kf) => kf.time === time);
}

export function addKeyframeTo({
  keyframes,
  time,
  value,
}: {
  keyframes: Keyframe[];
  time: number;
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
  time: number;
}): Keyframe[] {
  return keyframes.filter((kf) => kf.time !== time);
}

export function updateKeyframe({
  keyframes,
  time,
  value,
}: {
  keyframes: Keyframe[];
  time: number;
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

export const DEFAULT_TRANSFORM_VALUES = {
  centerX: 50,
  centerY: 50,
  rotation: 0,
  scale: 1,
  translateX: 0,
  translateY: 0,
  flipHorizontal: false,
  flipVertical: false,
} as const;

export const DEFAULT_ANIMATION: AnimationState = {
  keyframes: {
    rotation: [],
    scale: [],
    translateX: [],
    translateY: [],
    centerX: [],
    centerY: [],
    flipHorizontal: [],
    flipVertical: [],
  },
  duration: 5000,
  isPlaying: false,
  currentTime: 0,
  baseTransform: { ...DEFAULT_TRANSFORM_VALUES },
};

export function updateKeyframesWithTransform({
  keyframes,
  updates,
  currentTime,
}: {
  keyframes: AnimationKeyframes;
  updates: Partial<TransformState>;
  currentTime: number;
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
