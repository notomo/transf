import { describe, expect, it } from "vitest";
import type {
  AnimationKeyframes,
  AnimationState,
  Keyframe,
  TransformState,
} from "@/src/feature/animation-state";
import { DEFAULT_ANIMATION } from "@/src/feature/animation-state";
import {
  addKeyframeTo,
  deriveTransformFromAnimationState,
  findNextKeyframeTime,
  findPreviousKeyframeTime,
  getAllKeyframeTimeSet,
  hasKeyframeAtTime,
  hasKeyframeAtTimeInAllFields,
  hasKeyframes,
  interpolateKeyframes,
  moveKeyframe,
  removeKeyframeFrom,
  updateInterpolationTypeForAllFieldsAtTime,
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
    const keyframes: Keyframe[] = [
      { time: 0.5, value: 20, interpolationType: "linear" },
    ];
    const result = interpolateKeyframes({
      keyframes,
      time: 0.2,
      defaultValue: 10,
    });
    expect(result).toBe(20);
  });

  it("returns last keyframe value when time is after last keyframe", () => {
    const keyframes: Keyframe[] = [
      { time: 0.2, value: 20, interpolationType: "linear" },
    ];
    const result = interpolateKeyframes({
      keyframes,
      time: 0.8,
      defaultValue: 10,
    });
    expect(result).toBe(20);
  });

  it("interpolates between two keyframes", () => {
    const keyframes: Keyframe[] = [
      { time: 0, value: 0, interpolationType: "linear" },
      { time: 1, value: 100, interpolationType: "linear" },
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
      { time: 1, value: 100, interpolationType: "linear" },
      { time: 0, value: 0, interpolationType: "linear" },
    ];
    const result = interpolateKeyframes({
      keyframes,
      time: 0.5,
      defaultValue: 10,
    });
    expect(result).toBe(50);
  });
});

const defaultKeyframes: AnimationKeyframes = {
  rotation: [],
  scale: [],
  translateX: [],
  translateY: [],
  centerX: [],
  centerY: [],
  flipHorizontal: [],
  flipVertical: [],
};

describe("findPreviousKeyframeTime", () => {
  it("wraps around to last keyframe when no previous keyframes exist", () => {
    const keyframes: AnimationKeyframes = {
      ...defaultKeyframes,
      rotation: [{ time: 1, value: 90, interpolationType: "linear" }],
    };
    const result = findPreviousKeyframeTime({ keyframes, currentTime: 0.5 });
    expect(result).toBe(1);
  });

  it("returns undefined when no keyframes exist", () => {
    const keyframes: AnimationKeyframes = {
      ...defaultKeyframes,
    };
    const result = findPreviousKeyframeTime({ keyframes, currentTime: 0.5 });
    expect(result).toBeUndefined();
  });

  it("finds the previous keyframe time", () => {
    const keyframes: AnimationKeyframes = {
      ...defaultKeyframes,
      rotation: [
        { time: 0.2, value: 45, interpolationType: "linear" },
        { time: 0.8, value: 90, interpolationType: "linear" },
      ],
    };
    const result = findPreviousKeyframeTime({ keyframes, currentTime: 0.5 });
    expect(result).toBe(0.2);
  });
});

describe("findNextKeyframeTime", () => {
  it("wraps around to first keyframe when no next keyframes exist", () => {
    const keyframes: AnimationKeyframes = {
      ...defaultKeyframes,
      rotation: [{ time: 0.2, value: 90, interpolationType: "linear" }],
    };
    const result = findNextKeyframeTime({ keyframes, currentTime: 0.5 });
    expect(result).toBe(0.2);
  });

  it("returns undefined when no keyframes exist", () => {
    const keyframes: AnimationKeyframes = {
      ...defaultKeyframes,
    };
    const result = findNextKeyframeTime({ keyframes, currentTime: 0.5 });
    expect(result).toBeUndefined();
  });

  it("finds the next keyframe time", () => {
    const keyframes: AnimationKeyframes = {
      ...defaultKeyframes,
      rotation: [
        { time: 0.2, value: 45, interpolationType: "linear" },
        { time: 0.8, value: 90, interpolationType: "linear" },
      ],
    };
    const result = findNextKeyframeTime({ keyframes, currentTime: 0.5 });
    expect(result).toBe(0.8);
  });
});

describe("hasKeyframeAtTime", () => {
  it("returns false when no keyframe exists at the time", () => {
    const keyframes: Keyframe[] = [
      { time: 0.5, value: 90, interpolationType: "linear" },
    ];
    const result = hasKeyframeAtTime({ keyframes, time: 0.2 });
    expect(result).toBe(false);
  });

  it("returns true when keyframe exists at the time", () => {
    const keyframes: Keyframe[] = [
      { time: 0.5, value: 90, interpolationType: "linear" },
    ];
    const result = hasKeyframeAtTime({ keyframes, time: 0.5 });
    expect(result).toBe(true);
  });
});

describe("addKeyframeTo", () => {
  it("adds a new keyframe", () => {
    const keyframes: Keyframe[] = [
      { time: 0.5, value: 90, interpolationType: "linear" },
    ];
    const result = addKeyframeTo({ keyframes, time: 0.2, value: 45 });
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({
      time: 0.2,
      value: 45,
      interpolationType: "linear",
    });
  });

  it("replaces existing keyframe at the same time", () => {
    const keyframes: Keyframe[] = [
      { time: 0.5, value: 90, interpolationType: "linear" },
    ];
    const result = addKeyframeTo({ keyframes, time: 0.5, value: 180 });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      time: 0.5,
      value: 180,
      interpolationType: "linear",
    });
  });
});

describe("removeKeyframeFrom", () => {
  it("removes keyframe at specified time", () => {
    const keyframes: Keyframe[] = [
      { time: 0.2, value: 45, interpolationType: "linear" },
      { time: 0.5, value: 90, interpolationType: "linear" },
    ];
    const result = removeKeyframeFrom({ keyframes, time: 0.2 });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      time: 0.5,
      value: 90,
      interpolationType: "linear",
    });
  });

  it("returns unchanged array when keyframe does not exist", () => {
    const keyframes: Keyframe[] = [
      { time: 0.5, value: 90, interpolationType: "linear" },
    ];
    const result = removeKeyframeFrom({ keyframes, time: 0.2 });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      time: 0.5,
      value: 90,
      interpolationType: "linear",
    });
  });
});

describe("updateKeyframe", () => {
  it("updates existing keyframe value", () => {
    const keyframes: Keyframe[] = [
      { time: 0.5, value: 90, interpolationType: "linear" },
    ];
    const result = updateKeyframe({ keyframes, time: 0.5, value: 180 });
    expect(result[0]).toEqual({
      time: 0.5,
      value: 180,
      interpolationType: "linear",
    });
  });

  it("returns unchanged array when keyframe does not exist", () => {
    const keyframes: Keyframe[] = [
      { time: 0.5, value: 90, interpolationType: "linear" },
    ];
    const result = updateKeyframe({ keyframes, time: 0.2, value: 45 });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      time: 0.5,
      value: 90,
      interpolationType: "linear",
    });
  });
});

describe("deriveTransformFromAnimationState", () => {
  it("returns default values when keyframes are empty", () => {
    const state: AnimationState = {
      ...DEFAULT_ANIMATION,
    };
    const result = deriveTransformFromAnimationState({ state });
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
      ...DEFAULT_ANIMATION,
      keyframes: {
        ...defaultKeyframes,
        rotation: [
          { time: 0, value: 0, interpolationType: "linear" },
          { time: 1, value: 90, interpolationType: "linear" },
        ],
        scale: [
          { time: 0, value: 1, interpolationType: "linear" },
          { time: 1, value: 2, interpolationType: "linear" },
        ],
        flipHorizontal: [
          { time: 0, value: 0, interpolationType: "linear" },
          { time: 0.4, value: 1, interpolationType: "linear" },
        ],
        flipVertical: [],
      },
      duration: 5000,
      currentTime: 0.5,
    };
    const result = deriveTransformFromAnimationState({ state });
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
      ...DEFAULT_ANIMATION,
      keyframes: {
        ...defaultKeyframes,
        flipHorizontal: [
          { time: 0.5, value: 0.6, interpolationType: "linear" },
        ],
        flipVertical: [{ time: 0.5, value: 0.4, interpolationType: "linear" }],
      },
      currentTime: 0.5,
    };
    const result = deriveTransformFromAnimationState({ state });
    expect(result.flipHorizontal).toBe(true);
    expect(result.flipVertical).toBe(false);
  });

  it("uses base transform values when no keyframes exist", () => {
    const state: AnimationState = {
      ...DEFAULT_ANIMATION,
      duration: 5000,
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
    const result = deriveTransformFromAnimationState({ state });
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
      ...defaultKeyframes,
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
      ...defaultKeyframes,
      rotation: [{ time: 0, value: 0, interpolationType: "linear" }],
      scale: [{ time: 0, value: 1, interpolationType: "linear" }],
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
    expect(result.rotation).toContainEqual({
      time: 0.5,
      value: 45,
      interpolationType: "linear",
    });
    expect(result.scale).toHaveLength(2);
    expect(result.scale).toContainEqual({
      time: 0.5,
      value: 2,
      interpolationType: "linear",
    });
  });

  it("updates existing keyframes when time exists", () => {
    const keyframes: AnimationKeyframes = {
      ...defaultKeyframes,
      rotation: [{ time: 0.5, value: 0, interpolationType: "linear" }],
      scale: [{ time: 0.5, value: 1, interpolationType: "linear" }],
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
    expect(result.rotation[0]).toEqual({
      time: 0.5,
      value: 45,
      interpolationType: "linear",
    });
    expect(result.scale).toHaveLength(1);
    expect(result.scale[0]).toEqual({
      time: 0.5,
      value: 2,
      interpolationType: "linear",
    });
  });

  it("converts boolean values to numeric", () => {
    const keyframes: AnimationKeyframes = {
      ...defaultKeyframes,
      flipHorizontal: [{ time: 0, value: 0, interpolationType: "linear" }],
      flipVertical: [{ time: 0, value: 1, interpolationType: "linear" }],
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
    expect(result.flipHorizontal).toContainEqual({
      time: 0.5,
      value: 1,
      interpolationType: "linear",
    });
    expect(result.flipVertical).toHaveLength(2);
    expect(result.flipVertical).toContainEqual({
      time: 0.5,
      value: 0,
      interpolationType: "linear",
    });
  });

  it("ignores undefined values", () => {
    const keyframes: AnimationKeyframes = {
      ...defaultKeyframes,
      rotation: [{ time: 0, value: 0, interpolationType: "linear" }],
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
      ...defaultKeyframes,
      rotation: [{ time: 0, value: 0, interpolationType: "linear" }],
      scale: [{ time: 0.2, value: 1.5, interpolationType: "linear" }],
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

describe("hasKeyframes", () => {
  it("returns true when any field has keyframes", () => {
    const keyframes: AnimationKeyframes = {
      ...defaultKeyframes,
      rotation: [{ time: 0.5, value: 90, interpolationType: "linear" }],
    };
    const result = hasKeyframes(keyframes);
    expect(result).toBe(true);
  });

  it("returns false when all fields are empty", () => {
    const keyframes: AnimationKeyframes = {
      ...defaultKeyframes,
    };
    const result = hasKeyframes(keyframes);
    expect(result).toBe(false);
  });
});

describe("moveKeyframe", () => {
  it("successfully moves a keyframe to a new time", () => {
    const keyframes: Keyframe[] = [
      { time: 0.2, value: 45, interpolationType: "linear" },
      { time: 0.5, value: 90, interpolationType: "linear" },
    ];
    const result = moveKeyframe({ keyframes, fromTime: 0.2, toTime: 0.8 });
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({
      time: 0.8,
      value: 45,
      interpolationType: "linear",
    });
    expect(result).not.toContainEqual({
      time: 0.2,
      value: 45,
      interpolationType: "linear",
    });
  });

  it("returns unchanged array when source keyframe doesn't exist", () => {
    const keyframes: Keyframe[] = [
      { time: 0.5, value: 90, interpolationType: "linear" },
    ];
    const result = moveKeyframe({ keyframes, fromTime: 0.2, toTime: 0.8 });
    expect(result).toEqual(keyframes);
  });

  it("prevents moving outside valid range", () => {
    const keyframes: Keyframe[] = [
      { time: 0.5, value: 90, interpolationType: "linear" },
    ];
    const resultBelowZero = moveKeyframe({
      keyframes,
      fromTime: 0.5,
      toTime: -0.1,
    });
    const resultAboveOne = moveKeyframe({
      keyframes,
      fromTime: 0.5,
      toTime: 1.1,
    });
    expect(resultBelowZero).toEqual(keyframes);
    expect(resultAboveOne).toEqual(keyframes);
  });

  it("prevents moving too close to another keyframe", () => {
    const keyframes: Keyframe[] = [
      { time: 0.5, value: 90, interpolationType: "linear" },
      { time: 0.6, value: 180, interpolationType: "linear" },
    ];
    const result = moveKeyframe({
      keyframes,
      fromTime: 0.5,
      toTime: 0.61,
    });
    expect(result).toEqual(keyframes);
  });
});

describe("getAllKeyframeTimeSet", () => {
  it("returns empty Set when no keyframes exist", () => {
    const keyframes: AnimationKeyframes = {
      ...defaultKeyframes,
    };
    const result = getAllKeyframeTimeSet(keyframes);
    expect(result).toEqual(new Set());
  });

  it("returns unique times from multiple fields", () => {
    const keyframes: AnimationKeyframes = {
      ...defaultKeyframes,
      rotation: [
        { time: 0.2, value: 45, interpolationType: "linear" },
        { time: 0.5, value: 90, interpolationType: "linear" },
      ],
      scale: [
        { time: 0.5, value: 1.5, interpolationType: "linear" },
        { time: 0.8, value: 2, interpolationType: "linear" },
      ],
    };
    const result = getAllKeyframeTimeSet(keyframes);
    expect(result).toEqual(new Set([0.2, 0.5, 0.8]));
  });
});

describe("hasKeyframeAtTimeInAllFields", () => {
  it("returns false when no keyframes exist", () => {
    const keyframes: AnimationKeyframes = {
      ...defaultKeyframes,
    };
    const result = hasKeyframeAtTimeInAllFields({ keyframes, time: 0.5 });
    expect(result).toBe(false);
  });

  it("returns false when no keyframe exists at the specified time", () => {
    const keyframes: AnimationKeyframes = {
      ...defaultKeyframes,
      rotation: [{ time: 0.2, value: 45, interpolationType: "linear" }],
      scale: [{ time: 0.8, value: 2, interpolationType: "linear" }],
    };
    const result = hasKeyframeAtTimeInAllFields({ keyframes, time: 0.5 });
    expect(result).toBe(false);
  });

  it("returns true when a keyframe exists at the specified time in one field", () => {
    const keyframes: AnimationKeyframes = {
      ...defaultKeyframes,
      rotation: [{ time: 0.5, value: 90, interpolationType: "linear" }],
      scale: [{ time: 0.8, value: 2, interpolationType: "linear" }],
    };
    const result = hasKeyframeAtTimeInAllFields({ keyframes, time: 0.5 });
    expect(result).toBe(true);
  });
});

describe("updateInterpolationTypeForAllFieldsAtTime", () => {
  it("updates interpolationType for all fields at the same time", () => {
    const keyframes: AnimationKeyframes = {
      ...defaultKeyframes,
      rotation: [
        { time: 0.5, value: 90, interpolationType: "linear" },
        { time: 0.8, value: 180, interpolationType: "linear" },
      ],
      scale: [
        { time: 0.5, value: 2, interpolationType: "linear" },
        { time: 0.8, value: 3, interpolationType: "linear" },
      ],
      translateX: [{ time: 0.5, value: 100, interpolationType: "linear" }],
    };
    const result = updateInterpolationTypeForAllFieldsAtTime({
      keyframes,
      time: 0.5,
      interpolationType: "ease-in-out",
    });

    expect(result.rotation[0]?.interpolationType).toBe("ease-in-out");
    expect(result.rotation[1]?.interpolationType).toBe("linear");
    expect(result.scale[0]?.interpolationType).toBe("ease-in-out");
    expect(result.scale[1]?.interpolationType).toBe("linear");
    expect(result.translateX[0]?.interpolationType).toBe("ease-in-out");
  });

  it("only updates fields that have keyframes at the specified time", () => {
    const keyframes: AnimationKeyframes = {
      ...defaultKeyframes,
      rotation: [{ time: 0.5, value: 90, interpolationType: "linear" }],
      scale: [{ time: 0.8, value: 2, interpolationType: "linear" }],
    };
    const result = updateInterpolationTypeForAllFieldsAtTime({
      keyframes,
      time: 0.5,
      interpolationType: "ease-in",
    });

    expect(result.rotation[0]?.interpolationType).toBe("ease-in");
    expect(result.scale[0]?.interpolationType).toBe("linear");
  });

  it("returns unchanged keyframes when no fields have keyframes at the specified time", () => {
    const keyframes: AnimationKeyframes = {
      ...defaultKeyframes,
      rotation: [{ time: 0.2, value: 90, interpolationType: "linear" }],
      scale: [{ time: 0.8, value: 2, interpolationType: "linear" }],
    };
    const result = updateInterpolationTypeForAllFieldsAtTime({
      keyframes,
      time: 0.5,
      interpolationType: "ease-out",
    });

    expect(result).toEqual(keyframes);
  });

  it("preserves other keyframe properties", () => {
    const keyframes: AnimationKeyframes = {
      ...defaultKeyframes,
      rotation: [{ time: 0.5, value: 90, interpolationType: "linear" }],
    };
    const result = updateInterpolationTypeForAllFieldsAtTime({
      keyframes,
      time: 0.5,
      interpolationType: "ease",
    });

    expect(result.rotation[0]).toEqual({
      time: 0.5,
      value: 90,
      interpolationType: "ease",
    });
  });
});
