import * as v from "valibot";

export type RelativeTime = number; // 0.0-1.0

export type Keyframe = {
  time: RelativeTime;
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

export const DEFAULT_TRANSFORM_VALUES: TransformState = {
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
  currentTime: 0.0,
  baseTransform: { ...DEFAULT_TRANSFORM_VALUES },
};

const KeyframeSchema = v.object({
  time: v.number(),
  value: v.number(),
});

const AnimationKeyframesSchema = v.object({
  rotation: v.array(KeyframeSchema),
  scale: v.array(KeyframeSchema),
  translateX: v.array(KeyframeSchema),
  translateY: v.array(KeyframeSchema),
  centerX: v.array(KeyframeSchema),
  centerY: v.array(KeyframeSchema),
  flipHorizontal: v.array(KeyframeSchema),
  flipVertical: v.array(KeyframeSchema),
});

const TransformStateSchema = v.object({
  centerX: v.number(),
  centerY: v.number(),
  rotation: v.number(),
  scale: v.number(),
  translateX: v.number(),
  translateY: v.number(),
  flipHorizontal: v.boolean(),
  flipVertical: v.boolean(),
});

export type TransformState = v.InferOutput<typeof TransformStateSchema>;

export const AnimationStateSchema = v.object({
  keyframes: AnimationKeyframesSchema,
  duration: v.number(),
  isPlaying: v.boolean(),
  currentTime: v.number(),
  baseTransform: TransformStateSchema,
});

export type AnimationState = v.InferOutput<typeof AnimationStateSchema>;
