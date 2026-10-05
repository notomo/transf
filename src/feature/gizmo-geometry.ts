import type { TransformState } from "@/src/feature/animation-state";

export type Point = { x: number; y: number };

// Untransformed box of the root element in viewport coordinates.
export type Box = { left: number; top: number; width: number; height: number };

export type Size = { width: number; height: number };

export type MoveAxis = "x" | "y" | "free";

const MIN_SCALE = 0.1;
const MAX_SCALE = 5;

function calculateOrigin({
  transform,
  box,
}: {
  transform: TransformState;
  box: Box;
}): Point {
  return {
    x: (box.width * transform.centerX) / 100,
    y: (box.height * transform.centerY) / 100,
  };
}

export function calculatePivotPosition({
  transform,
  box,
}: {
  transform: TransformState;
  box: Box;
}): Point {
  const origin = calculateOrigin({ transform, box });
  return {
    x: box.left + origin.x + transform.translateX,
    y: box.top + origin.y + transform.translateY,
  };
}

export function calculateMove({
  start,
  from,
  to,
  axis,
}: {
  start: TransformState;
  from: Point;
  to: Point;
  axis: MoveAxis;
}): Pick<TransformState, "translateX" | "translateY"> {
  return {
    translateX:
      axis === "y" ? start.translateX : start.translateX + to.x - from.x,
    translateY:
      axis === "x" ? start.translateY : start.translateY + to.y - from.y,
  };
}

function normalizeDegree(degree: number): number {
  const normalized = ((((degree + 180) % 360) + 360) % 360) - 180;
  return normalized === -180 ? 180 : normalized;
}

export function calculateRotation({
  start,
  pivot,
  from,
  to,
}: {
  start: TransformState;
  pivot: Point;
  from: Point;
  to: Point;
}): number {
  const fromAngle = Math.atan2(from.y - pivot.y, from.x - pivot.x);
  const toAngle = Math.atan2(to.y - pivot.y, to.x - pivot.x);
  const delta = ((toAngle - fromAngle) * 180) / Math.PI;
  return normalizeDegree(start.rotation + delta);
}

export function calculateScale({
  start,
  pivot,
  from,
  to,
}: {
  start: TransformState;
  pivot: Point;
  from: Point;
  to: Point;
}): number {
  const fromDistance = Math.hypot(from.x - pivot.x, from.y - pivot.y);
  if (fromDistance === 0) {
    return start.scale;
  }
  const toDistance = Math.hypot(to.x - pivot.x, to.y - pivot.y);
  const scale = (start.scale * toDistance) / fromDistance;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

// Moves the transform origin to the given viewport point
// while keeping the page at the same visual position.
export function calculatePivotMove({
  start,
  box,
  to,
}: {
  start: TransformState;
  box: Box;
  to: Point;
}): Pick<TransformState, "centerX" | "centerY" | "translateX" | "translateY"> {
  const origin = calculateOrigin({ transform: start, box });
  const pivot = calculatePivotPosition({ transform: start, box });

  // Inverse of rotate(r) scale(sx, sy) applied to (to - pivot).
  const radian = (start.rotation * Math.PI) / 180;
  const cos = Math.cos(radian);
  const sin = Math.sin(radian);
  const dx = to.x - pivot.x;
  const dy = to.y - pivot.y;
  const rotatedX = cos * dx + sin * dy;
  const rotatedY = -sin * dx + cos * dy;
  const scaleX = start.flipHorizontal ? -start.scale : start.scale;
  const scaleY = start.flipVertical ? -start.scale : start.scale;

  const newOrigin = {
    x: origin.x + rotatedX / scaleX,
    y: origin.y + rotatedY / scaleY,
  };
  return {
    centerX: box.width === 0 ? start.centerX : (newOrigin.x / box.width) * 100,
    centerY:
      box.height === 0 ? start.centerY : (newOrigin.y / box.height) * 100,
    translateX: to.x - box.left - newOrigin.x,
    translateY: to.y - box.top - newOrigin.y,
  };
}

// Returns the transform origin that is placed at the center of the viewport.
export function calculateViewportCenterOrigin({
  box,
  viewport,
}: {
  box: Box;
  viewport: Size;
}): Pick<TransformState, "centerX" | "centerY"> {
  return {
    centerX:
      box.width === 0
        ? 50
        : ((viewport.width / 2 - box.left) / box.width) * 100,
    centerY:
      box.height === 0
        ? 50
        : ((viewport.height / 2 - box.top) / box.height) * 100,
  };
}

// Returns where to show the indicator for the pivot outside the viewport,
// or undefined if the pivot is inside the viewport.
export function calculateOffscreenIndicator({
  pivot,
  viewport,
  margin,
}: {
  pivot: Point;
  viewport: Size;
  margin: number;
}): { position: Point; angle: number } | undefined {
  const inside =
    pivot.x >= 0 &&
    pivot.x <= viewport.width &&
    pivot.y >= 0 &&
    pivot.y <= viewport.height;
  if (inside) {
    return undefined;
  }

  const position = {
    x: Math.min(viewport.width - margin, Math.max(margin, pivot.x)),
    y: Math.min(viewport.height - margin, Math.max(margin, pivot.y)),
  };
  const angle =
    (Math.atan2(pivot.y - position.y, pivot.x - position.x) * 180) / Math.PI;
  return { position, angle };
}
