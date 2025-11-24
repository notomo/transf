import { describe, expect, it } from "vitest";
import { calculateTimeFromPosition } from "./animation-time";

describe("calculateTimeFromPosition", () => {
  it("returns undefined when rect is undefined", () => {
    const result = calculateTimeFromPosition({ clientX: 100, rect: undefined });
    expect(result).toBeUndefined();
  });

  it("calculates relative time within rect bounds", () => {
    const result = calculateTimeFromPosition({
      clientX: 150,
      rect: { left: 100, width: 200 },
    });
    expect(result).toBe(0.25);
  });

  it("clamps negative values to 0", () => {
    const result = calculateTimeFromPosition({
      clientX: 50,
      rect: { left: 100, width: 200 },
    });
    expect(result).toBe(0);
  });

  it("clamps values greater than 1 to 1", () => {
    const result = calculateTimeFromPosition({
      clientX: 400,
      rect: { left: 100, width: 200 },
    });
    expect(result).toBe(1);
  });
});
