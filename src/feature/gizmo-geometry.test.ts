import { describe, expect, it } from "vitest";
import type { TransformState } from "@/src/feature/animation-state";
import { DEFAULT_ANIMATION } from "@/src/feature/animation-state";
import {
  type Box,
  calculateMove,
  calculatePivotMove,
  calculatePivotPosition,
  calculateRotation,
  calculateScale,
  type Point,
} from "./gizmo-geometry";

const box: Box = { left: -10, top: -20, width: 1000, height: 2000 };

function transformOf(updates: Partial<TransformState>): TransformState {
  return { ...DEFAULT_ANIMATION.baseTransform, ...updates };
}

// Applies the same transform as the generated CSS to a point in box coordinates.
function applyTransform({
  transform,
  point,
}: {
  transform: TransformState;
  point: Point;
}): Point {
  const originX = (box.width * transform.centerX) / 100;
  const originY = (box.height * transform.centerY) / 100;
  const scaleX = transform.flipHorizontal ? -transform.scale : transform.scale;
  const scaleY = transform.flipVertical ? -transform.scale : transform.scale;
  const x = (point.x - originX) * scaleX;
  const y = (point.y - originY) * scaleY;
  const radian = (transform.rotation * Math.PI) / 180;
  return {
    x:
      box.left +
      originX +
      transform.translateX +
      Math.cos(radian) * x -
      Math.sin(radian) * y,
    y:
      box.top +
      originY +
      transform.translateY +
      Math.sin(radian) * x +
      Math.cos(radian) * y,
  };
}

describe("calculatePivotPosition", () => {
  it("returns transform origin moved by translation", () => {
    const transform = transformOf({
      centerX: 25,
      centerY: 10,
      translateX: 5,
      translateY: -7,
    });
    expect(calculatePivotPosition({ transform, box })).toEqual({
      x: -10 + 250 + 5,
      y: -20 + 200 - 7,
    });
  });
});

describe("calculateMove", () => {
  const start = transformOf({ translateX: 10, translateY: 20 });
  const from = { x: 100, y: 100 };
  const to = { x: 130, y: 90 };

  it("moves freely", () => {
    expect(calculateMove({ start, from, to, axis: "free" })).toEqual({
      translateX: 40,
      translateY: 10,
    });
  });

  it("moves only along x axis", () => {
    expect(calculateMove({ start, from, to, axis: "x" })).toEqual({
      translateX: 40,
      translateY: 20,
    });
  });

  it("moves only along y axis", () => {
    expect(calculateMove({ start, from, to, axis: "y" })).toEqual({
      translateX: 10,
      translateY: 10,
    });
  });
});

describe("calculateRotation", () => {
  const pivot = { x: 100, y: 100 };

  it("rotates clockwise by the angle around pivot", () => {
    const rotation = calculateRotation({
      start: transformOf({ rotation: 10 }),
      pivot,
      from: { x: 200, y: 100 },
      to: { x: 100, y: 200 },
    });
    expect(rotation).toBeCloseTo(100);
  });

  it("normalizes into -180 to 180", () => {
    const rotation = calculateRotation({
      start: transformOf({ rotation: 170 }),
      pivot,
      from: { x: 200, y: 100 },
      to: { x: 100, y: 200 },
    });
    expect(rotation).toBeCloseTo(-100);
  });
});

describe("calculateScale", () => {
  const pivot = { x: 100, y: 100 };

  it("scales by distance ratio from pivot", () => {
    const scale = calculateScale({
      start: transformOf({ scale: 1.5 }),
      pivot,
      from: { x: 150, y: 100 },
      to: { x: 100, y: 200 },
    });
    expect(scale).toBeCloseTo(3);
  });

  it("clamps scale", () => {
    const scale = calculateScale({
      start: transformOf({ scale: 1 }),
      pivot,
      from: { x: 150, y: 100 },
      to: { x: 100, y: 100 },
    });
    expect(scale).toBe(0.1);
  });

  it("keeps scale when starting at pivot", () => {
    const scale = calculateScale({
      start: transformOf({ scale: 2 }),
      pivot,
      from: pivot,
      to: { x: 300, y: 300 },
    });
    expect(scale).toBe(2);
  });
});

describe("calculatePivotMove", () => {
  it.each([
    transformOf({}),
    transformOf({
      rotation: 30,
      scale: 1.5,
      translateX: 40,
      translateY: -60,
      centerX: 30,
      centerY: 70,
    }),
    transformOf({
      rotation: -120,
      scale: 0.5,
      flipHorizontal: true,
      flipVertical: true,
    }),
  ])("moves pivot to target without moving page: %o", (start) => {
    const to = { x: 321, y: 123 };
    const moved = { ...start, ...calculatePivotMove({ start, box, to }) };

    const pivot = calculatePivotPosition({ transform: moved, box });
    expect(pivot.x).toBeCloseTo(to.x);
    expect(pivot.y).toBeCloseTo(to.y);

    for (const point of [
      { x: 0, y: 0 },
      { x: 500, y: 1500 },
    ]) {
      const before = applyTransform({ transform: start, point });
      const after = applyTransform({ transform: moved, point });
      expect(after.x).toBeCloseTo(before.x);
      expect(after.y).toBeCloseTo(before.y);
    }
  });
});
