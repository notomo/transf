import { describe, expect, it } from "vitest";
import {
  type AnimationKeyframes,
  addKeyframeTo,
  findNextKeyframeTime,
  findPreviousKeyframeTime,
  hasKeyframeAtTime,
  interpolateKeyframes,
  type Keyframe,
  removeKeyframeFrom,
  updateKeyframe,
} from "./keyframe";

describe("interpolateKeyframes", () => {
  it("returns default value when keyframes array is empty", () => {
    const result = interpolateKeyframes([], 0.5, 10);
    expect(result).toBe(10);
  });

  it("returns first keyframe value when time is before first keyframe", () => {
    const keyframes: Keyframe[] = [{ time: 0.5, value: 20 }];
    const result = interpolateKeyframes(keyframes, 0.2, 10);
    expect(result).toBe(20);
  });

  it("returns last keyframe value when time is after last keyframe", () => {
    const keyframes: Keyframe[] = [{ time: 0.2, value: 20 }];
    const result = interpolateKeyframes(keyframes, 0.8, 10);
    expect(result).toBe(20);
  });

  it("interpolates between two keyframes", () => {
    const keyframes: Keyframe[] = [
      { time: 0, value: 0 },
      { time: 1, value: 100 },
    ];
    const result = interpolateKeyframes(keyframes, 0.5, 10);
    expect(result).toBe(50);
  });

  it("handles unsorted keyframes", () => {
    const keyframes: Keyframe[] = [
      { time: 1, value: 100 },
      { time: 0, value: 0 },
    ];
    const result = interpolateKeyframes(keyframes, 0.5, 10);
    expect(result).toBe(50);
  });
});

describe("findPreviousKeyframeTime", () => {
  it("returns undefined when no previous keyframes exist", () => {
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
    const result = findPreviousKeyframeTime(keyframes, 0.5);
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
    const result = findPreviousKeyframeTime(keyframes, 0.5);
    expect(result).toBe(0.2);
  });
});

describe("findNextKeyframeTime", () => {
  it("returns undefined when no next keyframes exist", () => {
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
    const result = findNextKeyframeTime(keyframes, 0.5);
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
    const result = findNextKeyframeTime(keyframes, 0.5);
    expect(result).toBe(0.8);
  });
});

describe("hasKeyframeAtTime", () => {
  it("returns false when no keyframe exists at the time", () => {
    const keyframes: Keyframe[] = [{ time: 0.5, value: 90 }];
    const result = hasKeyframeAtTime(keyframes, 0.2);
    expect(result).toBe(false);
  });

  it("returns true when keyframe exists at the time", () => {
    const keyframes: Keyframe[] = [{ time: 0.5, value: 90 }];
    const result = hasKeyframeAtTime(keyframes, 0.5);
    expect(result).toBe(true);
  });
});

describe("addKeyframeTo", () => {
  it("adds a new keyframe", () => {
    const keyframes: Keyframe[] = [{ time: 0.5, value: 90 }];
    const result = addKeyframeTo(keyframes, 0.2, 45);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ time: 0.2, value: 45 });
  });

  it("replaces existing keyframe at the same time", () => {
    const keyframes: Keyframe[] = [{ time: 0.5, value: 90 }];
    const result = addKeyframeTo(keyframes, 0.5, 180);
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
    const result = removeKeyframeFrom(keyframes, 0.2);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ time: 0.5, value: 90 });
  });

  it("returns unchanged array when keyframe does not exist", () => {
    const keyframes: Keyframe[] = [{ time: 0.5, value: 90 }];
    const result = removeKeyframeFrom(keyframes, 0.2);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ time: 0.5, value: 90 });
  });
});

describe("updateKeyframe", () => {
  it("updates existing keyframe value", () => {
    const keyframes: Keyframe[] = [{ time: 0.5, value: 90 }];
    const result = updateKeyframe(keyframes, 0.5, 180);
    expect(result[0]).toEqual({ time: 0.5, value: 180 });
  });

  it("returns unchanged array when keyframe does not exist", () => {
    const keyframes: Keyframe[] = [{ time: 0.5, value: 90 }];
    const result = updateKeyframe(keyframes, 0.2, 45);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ time: 0.5, value: 90 });
  });
});
