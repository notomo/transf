import {
  type AnimationState,
  DEFAULT_ANIMATION,
  type TransformState,
} from "@/src/feature/animation-state";
import { updateKeyframesWithTransform } from "@/src/feature/keyframe";

export function buildTransformUpdate({
  state,
  updates,
}: {
  state: AnimationState;
  updates: Partial<TransformState>;
}): Pick<AnimationState, "baseTransform" | "keyframes"> {
  return {
    baseTransform: {
      ...state.baseTransform,
      ...updates,
    },
    keyframes: updateKeyframesWithTransform({
      keyframes: state.keyframes,
      updates,
      currentTime: state.currentTime,
    }),
  };
}

// Keeps the pivot because it does not affect the reset transform and the gizmo stays where it was placed.
export function buildTransformReset(
  state: AnimationState,
): Pick<AnimationState, "baseTransform" | "keyframes"> {
  const {
    centerX: _centerX,
    centerY: _centerY,
    ...updates
  } = DEFAULT_ANIMATION.baseTransform;
  return buildTransformUpdate({ state, updates });
}
