import * as v from "valibot";
import { browser } from "wxt/browser";
import { storage } from "wxt/utils/storage";

// Type definitions
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
  currentTime: 0.0,
  baseTransform: { ...DEFAULT_TRANSFORM_VALUES },
};

// Validation schemas
const KeyframeSchema = v.object({
  time: v.number(),
  value: v.number(),
});

export const AnimationKeyframesSchema = v.object({
  rotation: v.array(KeyframeSchema),
  scale: v.array(KeyframeSchema),
  translateX: v.array(KeyframeSchema),
  translateY: v.array(KeyframeSchema),
  centerX: v.array(KeyframeSchema),
  centerY: v.array(KeyframeSchema),
  flipHorizontal: v.array(KeyframeSchema),
  flipVertical: v.array(KeyframeSchema),
});

export const TransformStateSchema = v.object({
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

// Storage for animation states per tab URL
export const animationStates = storage.defineItem<
  Record<string, AnimationState>
>("local:animationStates", {
  defaultValue: {},
});

export async function getCurrentTabInfo(): Promise<{
  tabId: number;
  url: string;
}> {
  const [activeTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!activeTab?.id || !activeTab?.url) {
    throw new Error("No active tab found");
  }

  return { tabId: activeTab.id, url: activeTab.url };
}

export async function getAnimationState(
  url: string,
): Promise<AnimationState | undefined> {
  const stored = await animationStates.getValue();
  return stored[url];
}

export async function saveAnimationState(
  url: string,
  state: AnimationState,
): Promise<void> {
  const stored = await animationStates.getValue();
  await animationStates.setValue({
    ...stored,
    [url]: state,
  });
}

export async function deleteAnimationState(url: string): Promise<void> {
  const stored = await animationStates.getValue();
  const updatedStored = { ...stored };
  delete updatedStored[url];
  await animationStates.setValue(updatedStored);
}
