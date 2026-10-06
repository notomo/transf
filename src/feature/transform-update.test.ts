import { describe, expect, it } from "vitest";
import type { AnimationState } from "@/src/feature/animation-state";
import { DEFAULT_ANIMATION } from "@/src/feature/animation-state";
import { buildTransformReset, buildTransformUpdate } from "./transform-update";

describe("buildTransformUpdate", () => {
  it("updates base transform without keyframes", () => {
    const update = buildTransformUpdate({
      state: DEFAULT_ANIMATION,
      updates: { rotation: 45 },
    });
    expect(update.baseTransform.rotation).toBe(45);
    expect(update.keyframes).toEqual(DEFAULT_ANIMATION.keyframes);
  });

  it("adds keyframe at current time to fields that have keyframes", () => {
    const state: AnimationState = {
      ...DEFAULT_ANIMATION,
      currentTime: 0.5,
      keyframes: {
        ...DEFAULT_ANIMATION.keyframes,
        rotation: [{ time: 0, value: 0, interpolationType: "linear" }],
      },
    };
    const update = buildTransformUpdate({
      state,
      updates: { rotation: 90, scale: 2 },
    });
    expect(update.keyframes.rotation).toEqual([
      { time: 0, value: 0, interpolationType: "linear" },
      { time: 0.5, value: 90, interpolationType: "linear" },
    ]);
    expect(update.keyframes.scale).toEqual([]);
    expect(update.baseTransform.scale).toBe(2);
  });
});

describe("buildTransformReset", () => {
  it("resets transform except pivot", () => {
    const state: AnimationState = {
      ...DEFAULT_ANIMATION,
      baseTransform: {
        centerX: 10,
        centerY: 20,
        rotation: 45,
        scale: 2,
        translateX: 30,
        translateY: 40,
        flipHorizontal: true,
        flipVertical: true,
      },
    };
    const update = buildTransformReset(state);
    expect(update.baseTransform).toEqual({
      ...DEFAULT_ANIMATION.baseTransform,
      centerX: 10,
      centerY: 20,
    });
  });

  it("resets keyframes only at current time", () => {
    const state: AnimationState = {
      ...DEFAULT_ANIMATION,
      currentTime: 0.5,
      keyframes: {
        ...DEFAULT_ANIMATION.keyframes,
        rotation: [{ time: 0, value: 90, interpolationType: "linear" }],
        centerX: [{ time: 0, value: 10, interpolationType: "linear" }],
      },
    };
    const update = buildTransformReset(state);
    expect(update.keyframes.rotation).toEqual([
      { time: 0, value: 90, interpolationType: "linear" },
      { time: 0.5, value: 0, interpolationType: "linear" },
    ]);
    expect(update.keyframes.centerX).toEqual(state.keyframes.centerX);
  });
});
