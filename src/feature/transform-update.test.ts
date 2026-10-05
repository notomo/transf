import { describe, expect, it } from "vitest";
import type { AnimationState } from "@/src/feature/animation-state";
import { DEFAULT_ANIMATION } from "@/src/feature/animation-state";
import { buildTransformUpdate } from "./transform-update";

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
