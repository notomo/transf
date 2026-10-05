import type { AnimationState } from "@/src/feature/animation-state";
import {
  calculateOffscreenIndicator,
  calculatePivotPosition,
  type Point,
  type Size,
} from "@/src/feature/gizmo-geometry";
import { deriveTransformFromAnimationState } from "@/src/feature/keyframe";
import { TopLayerPortal } from "./top-layer-portal";
import { useGizmoDrag } from "./use-gizmo-drag";
import { useRootBox } from "./use-root-layout";

const RING_RADIUS = 70;
const ARROW_LENGTH = 110;
const SCALE_HANDLE_DISTANCE = (RING_RADIUS + 26) / Math.SQRT2;
const INDICATOR_RADIUS = 14;
const INDICATOR_MARGIN = INDICATOR_RADIUS + 6;

const STYLE = `
svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
  filter: drop-shadow(0 0 1px rgb(0 0 0 / 0.8));
}
.handle {
  pointer-events: all;
}
.handle:hover .visible {
  stroke-width: 4;
}
`;

function Arrow({
  axis,
  color,
  handleProps,
}: {
  axis: "x" | "y";
  color: string;
  handleProps: ReturnType<ReturnType<typeof useGizmoDrag>["getHandleProps"]>;
}) {
  // Screen y axis points down, so the y arrow is drawn upward like a 3D gizmo.
  const rotate = axis === "x" ? 0 : -90;
  const label = axis === "x" ? "Move X" : "Move Y";
  return (
    <g
      className="handle"
      transform={`rotate(${rotate})`}
      style={{ cursor: axis === "x" ? "ew-resize" : "ns-resize" }}
      data-testid={`transf-gizmo-move-${axis}`}
      {...handleProps}
    >
      <title>{label}</title>
      <rect x={14} y={-8} width={ARROW_LENGTH} height={16} fill="transparent" />
      <line
        className="visible"
        x1={14}
        y1={0}
        x2={ARROW_LENGTH - 12}
        y2={0}
        stroke={color}
        strokeWidth={3}
      />
      <polygon
        points={`${ARROW_LENGTH},0 ${ARROW_LENGTH - 14},-6 ${ARROW_LENGTH - 14},6`}
        fill={color}
      />
    </g>
  );
}

function OffscreenIndicator({
  pivot,
  viewport,
}: {
  pivot: Point;
  viewport: Size;
}) {
  const indicator = calculateOffscreenIndicator({
    pivot,
    viewport,
    margin: INDICATOR_MARGIN,
  });
  if (!indicator) {
    return null;
  }

  const scrollToPivot = () => {
    window.scrollTo({
      left: window.scrollX + pivot.x - viewport.width / 2,
      top: window.scrollY + pivot.y - viewport.height / 2,
      behavior: "smooth",
    });
  };

  const { position, angle } = indicator;
  return (
    <g
      className="handle"
      transform={`translate(${position.x} ${position.y})`}
      style={{ cursor: "pointer" }}
      data-testid="transf-gizmo-indicator"
      onPointerDown={(e) => {
        if (e.button !== 0) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        scrollToPivot();
      }}
    >
      <title>Scroll to gizmo</title>
      <circle
        r={INDICATOR_RADIUS}
        fill="#4dabf7"
        stroke="white"
        strokeWidth={2}
      />
      <polygon
        points="9,0 -5,-6 -5,6"
        fill="white"
        transform={`rotate(${angle})`}
      />
    </g>
  );
}

export function Gizmo({
  animationState,
  setAnimationState,
  setIsDragging,
}: {
  animationState: AnimationState;
  setAnimationState: (state: AnimationState) => void;
  setIsDragging: (isDragging: boolean) => void;
}) {
  const box = useRootBox();
  const { getHandleProps } = useGizmoDrag({
    animationState,
    box,
    setAnimationState,
    setIsDragging,
  });

  const transform = deriveTransformFromAnimationState({
    state: animationState,
  });
  const pivot = calculatePivotPosition({ transform, box });

  return (
    <TopLayerPortal>
      {(viewport) => (
        <>
          <style>{STYLE}</style>
          <svg aria-hidden="true">
            <g transform={`translate(${pivot.x} ${pivot.y})`}>
              <g
                className="handle"
                style={{ cursor: "grab", pointerEvents: "stroke" }}
                data-testid="transf-gizmo-rotate"
                {...getHandleProps({ type: "rotate" })}
              >
                <title>Rotate</title>
                <circle
                  r={RING_RADIUS}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={16}
                />
                <circle
                  className="visible"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="#4dabf7"
                  strokeWidth={2}
                />
              </g>

              <Arrow
                axis="x"
                color="#ff4d4f"
                handleProps={getHandleProps({ type: "move", axis: "x" })}
              />
              <Arrow
                axis="y"
                color="#52c41a"
                handleProps={getHandleProps({ type: "move", axis: "y" })}
              />

              <g
                className="handle"
                transform={`translate(${SCALE_HANDLE_DISTANCE} ${SCALE_HANDLE_DISTANCE})`}
                style={{ cursor: "nwse-resize" }}
                data-testid="transf-gizmo-scale"
                {...getHandleProps({ type: "scale" })}
              >
                <title>Scale</title>
                <rect
                  className="visible"
                  x={-7}
                  y={-7}
                  width={14}
                  height={14}
                  transform="rotate(45)"
                  fill="#fadb14"
                  stroke="#fadb14"
                  strokeWidth={1}
                />
              </g>

              <g
                className="handle"
                style={{ cursor: "move" }}
                data-testid="transf-gizmo-move"
                {...getHandleProps({ type: "move", axis: "free" })}
              >
                <title>Move (Alt+drag: move pivot)</title>
                <rect
                  className="visible"
                  x={-8}
                  y={-8}
                  width={16}
                  height={16}
                  fill="rgb(255 255 255 / 0.6)"
                  stroke="#4dabf7"
                  strokeWidth={2}
                />
              </g>
            </g>
            <OffscreenIndicator pivot={pivot} viewport={viewport} />
          </svg>
        </>
      )}
    </TopLayerPortal>
  );
}
