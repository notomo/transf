import type { PointerEvent } from "react";
import { useEffect, useRef } from "react";
import type {
  AnimationState,
  TransformState,
} from "@/src/feature/animation-state";
import {
  type Box,
  calculateMove,
  calculatePivotMove,
  calculatePivotPosition,
  calculateRotation,
  calculateScale,
  type MoveAxis,
  type Point,
} from "@/src/feature/gizmo-geometry";
import { deriveTransformFromAnimationState } from "@/src/feature/keyframe";
import { sendUpdateAnimationStateMessage } from "@/src/feature/message/update-animation-state";
import { buildTransformUpdate } from "@/src/feature/transform-update";

export type DragMode =
  | { type: "move"; axis: MoveAxis }
  | { type: "rotate" }
  | { type: "scale" }
  | { type: "pivot"; axis: MoveAxis };

type Drag = {
  mode: DragMode;
  from: Point;
  box: Box;
  startState: AnimationState;
  update: Pick<AnimationState, "baseTransform" | "keyframes"> | null;
};

function calculateUpdates({
  drag,
  to,
}: {
  drag: Drag;
  to: Point;
}): Partial<TransformState> {
  const start = deriveTransformFromAnimationState({ state: drag.startState });
  const pivot = calculatePivotPosition({ transform: start, box: drag.box });
  const mode = drag.mode;
  switch (mode.type) {
    case "move":
      return calculateMove({ start, from: drag.from, to, axis: mode.axis });
    case "rotate":
      return {
        rotation: calculateRotation({ start, pivot, from: drag.from, to }),
      };
    case "scale":
      return { scale: calculateScale({ start, pivot, from: drag.from, to }) };
    case "pivot": {
      // Moves the pivot by the pointer movement so that it does not jump to the pointer.
      const moved = calculateMove({
        start,
        from: drag.from,
        to,
        axis: mode.axis,
      });
      return calculatePivotMove({
        start,
        box: drag.box,
        to: {
          x: pivot.x + moved.translateX - start.translateX,
          y: pivot.y + moved.translateY - start.translateY,
        },
      });
    }
    default:
      throw new Error(`unexpected drag mode: ${mode satisfies never}`);
  }
}

export function useGizmoDrag({
  animationState,
  box,
  pivotMode,
  setAnimationState,
  setIsDragging,
}: {
  animationState: AnimationState;
  box: Box;
  // If true, move handles move only the pivot. Alt key inverts it while dragging.
  pivotMode: boolean;
  setAnimationState: (state: AnimationState) => void;
  setIsDragging: (isDragging: boolean) => void;
}) {
  const dragRef = useRef<Drag | null>(null);

  const cancel = () => {
    const drag = dragRef.current;
    if (!drag) {
      return;
    }
    dragRef.current = null;
    setIsDragging(false);
    setAnimationState(drag.startState);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !dragRef.current) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      cancel();
    };
    window.addEventListener("keydown", handler, { capture: true });
    return () => {
      window.removeEventListener("keydown", handler, { capture: true });
    };
  });

  const getHandleProps = (mode: DragMode) => ({
    onPointerDown: (e: PointerEvent<SVGElement>) => {
      if (e.button !== 0) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = {
        mode:
          mode.type === "move" && pivotMode !== e.altKey
            ? { type: "pivot", axis: mode.axis }
            : mode,
        from: { x: e.clientX, y: e.clientY },
        box,
        startState: animationState,
        update: null,
      };
      setIsDragging(true);
    },
    onPointerMove: (e: PointerEvent<SVGElement>) => {
      const drag = dragRef.current;
      if (!drag) {
        return;
      }
      const updates = calculateUpdates({
        drag,
        to: { x: e.clientX, y: e.clientY },
      });
      drag.update = buildTransformUpdate({ state: drag.startState, updates });
      setAnimationState({ ...drag.startState, ...drag.update });
    },
    onPointerUp: async () => {
      const drag = dragRef.current;
      if (!drag) {
        return;
      }
      dragRef.current = null;
      setIsDragging(false);
      if (drag.update) {
        await sendUpdateAnimationStateMessage({ animationState: drag.update });
      }
    },
    onPointerCancel: cancel,
  });

  return { getHandleProps };
}
