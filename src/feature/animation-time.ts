import type { RelativeTime } from "./animation-state";

export function calculateTimeFromPosition({
  clientX,
  rect,
}: {
  clientX: number;
  rect?: { left: number; width: number };
}): RelativeTime | undefined {
  if (!rect) {
    return undefined;
  }

  const relativeX = clientX - rect.left;
  return Math.max(0, Math.min(1, relativeX / rect.width));
}
