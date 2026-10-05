import type {
  AnimationState,
  TransformState,
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
