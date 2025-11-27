import { describe, expect, it } from "vitest";
import type { AnimationState } from "@/src/feature/animation-state";
import { DEFAULT_ANIMATION } from "@/src/feature/animation-state";
import { generateAnimationStyles } from "./animation-css";

describe("generateAnimationStyles", () => {
  it("generates CSS keyframes and animation when keyframes exist", () => {
    const state: AnimationState = {
      ...DEFAULT_ANIMATION,
      keyframes: {
        rotation: [
          { time: 0, value: 0, interpolationType: "linear" },
          { time: 1, value: 360, interpolationType: "linear" },
        ],
        scale: [],
        translateX: [],
        translateY: [],
        centerX: [],
        centerY: [],
        flipHorizontal: [],
        flipVertical: [],
      },
      duration: 1000,
      isPlaying: true,
      currentTime: 0.5,
      baseTransform: {
        centerX: 50,
        centerY: 50,
        rotation: 0,
        scale: 1,
        translateX: 0,
        translateY: 0,
        flipHorizontal: false,
        flipVertical: false,
      },
    };

    const result = generateAnimationStyles(state);

    expect(result).toContain("@keyframes transf-animation");
    expect(result).toContain("animation:");
    expect(result).toContain("animation-delay:");
    expect(result).toContain("1000ms linear infinite running !important;");
    expect(result).toContain("animation-delay: -500ms !important;");
  });

  it("generates static transform when no keyframes exist", () => {
    const state: AnimationState = {
      ...DEFAULT_ANIMATION,
      baseTransform: {
        centerX: 25,
        centerY: 75,
        rotation: 45,
        scale: 1.5,
        translateX: 100,
        translateY: -50,
        flipHorizontal: false,
        flipVertical: false,
      },
    };

    const result = generateAnimationStyles(state);

    expect(result).toContain("transform-origin: 25% 75%;");
    expect(result).toContain(
      "transform: translate(100px, -50px) rotate(45deg) scale(1.5, 1.5);",
    );
    expect(result).toContain("transition: transform 0.3s ease;");
    expect(result).not.toContain("@keyframes");
    expect(result).not.toContain("animation:");
  });
});
