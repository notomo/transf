import { describe, expect, it } from "vitest";
import {
  type AnimationKeyframes,
  type AnimationState,
  addKeyframeTo,
  DEFAULT_TRANSFORM_VALUES,
  deriveTransformFromAnimationState,
  findNextKeyframeTime,
  findPreviousKeyframeTime,
  hasKeyframeAtTime,
  interpolateKeyframes,
  type Keyframe,
  removeKeyframeFrom,
  type TransformState,
  updateKeyframe,
  updateKeyframesWithTransform,
} from "./keyframe";

describe("interpolateKeyframes", () => {
  it("returns default value when keyframes array is empty", () => {
    const result = interpolateKeyframes({
      keyframes: [],
      time: 0.5,
      defaultValue: 10,
    });
    expect(result).toBe(10);
  });

  it("returns first keyframe value when time is before first keyframe", () => {
    const keyframes: Keyframe[] = [{ time: 0.5, value: 20 }];
    const result = interpolateKeyframes({
      keyframes,
      time: 0.2,
      defaultValue: 10,
    });
    expect(result).toBe(20);
  });

  it("returns last keyframe value when time is after last keyframe", () => {
    const keyframes: Keyframe[] = [{ time: 0.2, value: 20 }];
    const result = interpolateKeyframes({
      keyframes,
      time: 0.8,
      defaultValue: 10,
    });
    expect(result).toBe(20);
  });

  it("interpolates between two keyframes", () => {
    const keyframes: Keyframe[] = [
      { time: 0, value: 0 },
      { time: 1, value: 100 },
    ];
    const result = interpolateKeyframes({
      keyframes,
      time: 0.5,
      defaultValue: 10,
    });
    expect(result).toBe(50);
  });

  it("handles unsorted keyframes", () => {
    const keyframes: Keyframe[] = [
      { time: 1, value: 100 },
      { time: 0, value: 0 },
    ];
    const result = interpolateKeyframes({
      keyframes,
      time: 0.5,
      defaultValue: 10,
    });
    expect(result).toBe(50);
  });
});

describe("findPreviousKeyframeTime", () => {
  it("wraps around to last keyframe when no previous keyframes exist", () => {
    const keyframes: AnimationKeyframes = {
      rotation: [{ time: 1, value: 90 }],
      scale: [],
      translateX: [],
      translateY: [],
      centerX: [],
      centerY: [],
      flipHorizontal: [],
      flipVertical: [],
    };
    const result = findPreviousKeyframeTime({ keyframes, currentTime: 0.5 });
    expect(result).toBe(1);
  });

  it("returns undefined when no keyframes exist", () => {
    const keyframes: AnimationKeyframes = {
      rotation: [],
      scale: [],
      translateX: [],
      translateY: [],
      centerX: [],
      centerY: [],
      flipHorizontal: [],
      flipVertical: [],
    };
    const result = findPreviousKeyframeTime({ keyframes, currentTime: 0.5 });
    expect(result).toBeUndefined();
  });

  it("finds the previous keyframe time", () => {
    const keyframes: AnimationKeyframes = {
      rotation: [
        { time: 0.2, value: 45 },
        { time: 0.8, value: 90 },
      ],
      scale: [],
      translateX: [],
      translateY: [],
      centerX: [],
      centerY: [],
      flipHorizontal: [],
      flipVertical: [],
    };
    const result = findPreviousKeyframeTime({ keyframes, currentTime: 0.5 });
    expect(result).toBe(0.2);
  });
});

describe("findNextKeyframeTime", () => {
  it("wraps around to first keyframe when no next keyframes exist", () => {
    const keyframes: AnimationKeyframes = {
      rotation: [{ time: 0.2, value: 90 }],
      scale: [],
      translateX: [],
      translateY: [],
      centerX: [],
      centerY: [],
      flipHorizontal: [],
      flipVertical: [],
    };
    const result = findNextKeyframeTime({ keyframes, currentTime: 0.5 });
    expect(result).toBe(0.2);
  });

  it("returns undefined when no keyframes exist", () => {
    const keyframes: AnimationKeyframes = {
      rotation: [],
      scale: [],
      translateX: [],
      translateY: [],
      centerX: [],
      centerY: [],
      flipHorizontal: [],
      flipVertical: [],
    };
    const result = findNextKeyframeTime({ keyframes, currentTime: 0.5 });
    expect(result).toBeUndefined();
  });

  it("finds the next keyframe time", () => {
    const keyframes: AnimationKeyframes = {
      rotation: [
        { time: 0.2, value: 45 },
        { time: 0.8, value: 90 },
      ],
      scale: [],
      translateX: [],
      translateY: [],
      centerX: [],
      centerY: [],
      flipHorizontal: [],
      flipVertical: [],
    };
    const result = findNextKeyframeTime({ keyframes, currentTime: 0.5 });
    expect(result).toBe(0.8);
  });
});

describe("hasKeyframeAtTime", () => {
  it("returns false when no keyframe exists at the time", () => {
    const keyframes: Keyframe[] = [{ time: 0.5, value: 90 }];
    const result = hasKeyframeAtTime({ keyframes, time: 0.2 });
    expect(result).toBe(false);
  });

  it("returns true when keyframe exists at the time", () => {
    const keyframes: Keyframe[] = [{ time: 0.5, value: 90 }];
    const result = hasKeyframeAtTime({ keyframes, time: 0.5 });
    expect(result).toBe(true);
  });
});

describe("addKeyframeTo", () => {
  it("adds a new keyframe", () => {
    const keyframes: Keyframe[] = [{ time: 0.5, value: 90 }];
    const result = addKeyframeTo({ keyframes, time: 0.2, value: 45 });
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ time: 0.2, value: 45 });
  });

  it("replaces existing keyframe at the same time", () => {
    const keyframes: Keyframe[] = [{ time: 0.5, value: 90 }];
    const result = addKeyframeTo({ keyframes, time: 0.5, value: 180 });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ time: 0.5, value: 180 });
  });
});

describe("removeKeyframeFrom", () => {
  it("removes keyframe at specified time", () => {
    const keyframes: Keyframe[] = [
      { time: 0.2, value: 45 },
      { time: 0.5, value: 90 },
    ];
    const result = removeKeyframeFrom({ keyframes, time: 0.2 });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ time: 0.5, value: 90 });
  });

  it("returns unchanged array when keyframe does not exist", () => {
    const keyframes: Keyframe[] = [{ time: 0.5, value: 90 }];
    const result = removeKeyframeFrom({ keyframes, time: 0.2 });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ time: 0.5, value: 90 });
  });
});

describe("updateKeyframe", () => {
  it("updates existing keyframe value", () => {
    const keyframes: Keyframe[] = [{ time: 0.5, value: 90 }];
    const result = updateKeyframe({ keyframes, time: 0.5, value: 180 });
    expect(result[0]).toEqual({ time: 0.5, value: 180 });
  });

  it("returns unchanged array when keyframe does not exist", () => {
    const keyframes: Keyframe[] = [{ time: 0.5, value: 90 }];
    const result = updateKeyframe({ keyframes, time: 0.2, value: 45 });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ time: 0.5, value: 90 });
  });
});

describe("deriveTransformFromAnimationState", () => {
  it("returns default values when keyframes are empty", () => {
    const state: AnimationState = {
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
      currentTime: 0.5,
      baseTransform: { ...DEFAULT_TRANSFORM_VALUES },
    };
    const result = deriveTransformFromAnimationState(state);
    expect(result).toEqual({
      centerX: 50,
      centerY: 50,
      rotation: 0,
      scale: 1,
      translateX: 0,
      translateY: 0,
      flipHorizontal: false,
      flipVertical: false,
    });
  });

  it("interpolates values from keyframes", () => {
    const state: AnimationState = {
      keyframes: {
        rotation: [
          { time: 0, value: 0 },
          { time: 1, value: 90 },
        ],
        scale: [
          { time: 0, value: 1 },
          { time: 1, value: 2 },
        ],
        translateX: [],
        translateY: [],
        centerX: [],
        centerY: [],
        flipHorizontal: [
          { time: 0, value: 0 },
          { time: 0.4, value: 1 },
        ],
        flipVertical: [],
      },
      duration: 5000,
      isPlaying: false,
      currentTime: 0.5,
      baseTransform: { ...DEFAULT_TRANSFORM_VALUES },
    };
    const result = deriveTransformFromAnimationState(state);
    expect(result).toEqual({
      centerX: 50,
      centerY: 50,
      rotation: 45,
      scale: 1.5,
      translateX: 0,
      translateY: 0,
      flipHorizontal: true,
      flipVertical: false,
    });
  });

  it("handles boolean flip values correctly", () => {
    const state: AnimationState = {
      keyframes: {
        rotation: [],
        scale: [],
        translateX: [],
        translateY: [],
        centerX: [],
        centerY: [],
        flipHorizontal: [{ time: 0.5, value: 0.6 }],
        flipVertical: [{ time: 0.5, value: 0.4 }],
      },
      duration: 5000,
      isPlaying: false,
      currentTime: 0.5,
      baseTransform: { ...DEFAULT_TRANSFORM_VALUES },
    };
    const result = deriveTransformFromAnimationState(state);
    expect(result.flipHorizontal).toBe(true);
    expect(result.flipVertical).toBe(false);
  });

  it("uses base transform values when no keyframes exist", () => {
    const state: AnimationState = {
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
      currentTime: 0.5,
      baseTransform: {
        centerX: 25,
        centerY: 75,
        rotation: 45,
        scale: 2,
        translateX: 100,
        translateY: -50,
        flipHorizontal: true,
        flipVertical: false,
      },
    };
    const result = deriveTransformFromAnimationState(state);
    expect(result).toEqual({
      centerX: 25,
      centerY: 75,
      rotation: 45,
      scale: 2,
      translateX: 100,
      translateY: -50,
      flipHorizontal: true,
      flipVertical: false,
    });
  });
});

describe("updateKeyframesWithTransform", () => {
  it("skips fields with no existing keyframes", () => {
    const keyframes: AnimationKeyframes = {
      rotation: [],
      scale: [],
      translateX: [],
      translateY: [],
      centerX: [],
      centerY: [],
      flipHorizontal: [],
      flipVertical: [],
    };
    const updates: Partial<TransformState> = {
      rotation: 45,
      scale: 2,
    };
    const result = updateKeyframesWithTransform({
      keyframes,
      updates,
      currentTime: 0.5,
    });
    expect(result).toEqual(keyframes);
  });

  it("adds new keyframes when time doesn't exist", () => {
    const keyframes: AnimationKeyframes = {
      rotation: [{ time: 0, value: 0 }],
      scale: [{ time: 0, value: 1 }],
      translateX: [],
      translateY: [],
      centerX: [],
      centerY: [],
      flipHorizontal: [],
      flipVertical: [],
    };
    const updates: Partial<TransformState> = {
      rotation: 45,
      scale: 2,
    };
    const result = updateKeyframesWithTransform({
      keyframes,
      updates,
      currentTime: 0.5,
    });
    expect(result.rotation).toHaveLength(2);
    expect(result.rotation).toContainEqual({ time: 0.5, value: 45 });
    expect(result.scale).toHaveLength(2);
    expect(result.scale).toContainEqual({ time: 0.5, value: 2 });
  });

  it("updates existing keyframes when time exists", () => {
    const keyframes: AnimationKeyframes = {
      rotation: [{ time: 0.5, value: 0 }],
      scale: [{ time: 0.5, value: 1 }],
      translateX: [],
      translateY: [],
      centerX: [],
      centerY: [],
      flipHorizontal: [],
      flipVertical: [],
    };
    const updates: Partial<TransformState> = {
      rotation: 45,
      scale: 2,
    };
    const result = updateKeyframesWithTransform({
      keyframes,
      updates,
      currentTime: 0.5,
    });
    expect(result.rotation).toHaveLength(1);
    expect(result.rotation[0]).toEqual({ time: 0.5, value: 45 });
    expect(result.scale).toHaveLength(1);
    expect(result.scale[0]).toEqual({ time: 0.5, value: 2 });
  });

  it("converts boolean values to numeric", () => {
    const keyframes: AnimationKeyframes = {
      rotation: [],
      scale: [],
      translateX: [],
      translateY: [],
      centerX: [],
      centerY: [],
      flipHorizontal: [{ time: 0, value: 0 }],
      flipVertical: [{ time: 0, value: 1 }],
    };
    const updates: Partial<TransformState> = {
      flipHorizontal: true,
      flipVertical: false,
    };
    const result = updateKeyframesWithTransform({
      keyframes,
      updates,
      currentTime: 0.5,
    });
    expect(result.flipHorizontal).toHaveLength(2);
    expect(result.flipHorizontal).toContainEqual({ time: 0.5, value: 1 });
    expect(result.flipVertical).toHaveLength(2);
    expect(result.flipVertical).toContainEqual({ time: 0.5, value: 0 });
  });

  it("ignores undefined values", () => {
    const keyframes: AnimationKeyframes = {
      rotation: [{ time: 0, value: 0 }],
      scale: [],
      translateX: [],
      translateY: [],
      centerX: [],
      centerY: [],
      flipHorizontal: [],
      flipVertical: [],
    };
    const updates: Partial<TransformState> = {
      rotation: 45,
      scale: undefined,
    };
    const result = updateKeyframesWithTransform({
      keyframes,
      updates,
      currentTime: 0.5,
    });
    expect(result.rotation).toHaveLength(2);
    expect(result.scale).toHaveLength(0);
  });

  it("preserves other keyframe fields unchanged", () => {
    const keyframes: AnimationKeyframes = {
      rotation: [{ time: 0, value: 0 }],
      scale: [{ time: 0.2, value: 1.5 }],
      translateX: [],
      translateY: [],
      centerX: [],
      centerY: [],
      flipHorizontal: [],
      flipVertical: [],
    };
    const updates: Partial<TransformState> = {
      rotation: 45,
    };
    const result = updateKeyframesWithTransform({
      keyframes,
      updates,
      currentTime: 0.5,
    });
    expect(result.scale).toEqual(keyframes.scale);
    expect(result.translateX).toEqual(keyframes.translateX);
  });
});
