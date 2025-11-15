import { useCallback, useEffect, useState } from "react";
import type {
  AnimationState,
  KeyframeFieldName,
  TransformState,
} from "@/src/feature/animation-state";
import { DEFAULT_ANIMATION } from "@/src/feature/animation-state";
import {
  addKeyframeTo,
  deriveTransformFromAnimationState,
  hasKeyframeAtTime,
  removeKeyframeFrom,
  updateKeyframesWithTransform,
} from "@/src/feature/keyframe";
import { sendGetAnimationStateMessage } from "@/src/feature/message/get-animation-state";
import { sendUpdateAnimationStateMessage } from "@/src/feature/message/update-animation-state";

function useAnimationState() {
  const [state, setState] = useState<AnimationState | null>(null);

  useEffect(() => {
    (async () => {
      const response = await sendGetAnimationStateMessage();
      setState(response.animationState);
    })();
  }, []);

  const setAnimationState = useCallback(
    async (updates: Partial<AnimationState | null>) => {
      await sendUpdateAnimationStateMessage({
        animationState: updates,
      });
      const response = await sendGetAnimationStateMessage();
      setState(response.animationState);
    },
    [],
  );

  return {
    state: state ?? DEFAULT_ANIMATION,
    setAnimationState,
  };
}

export function useTransform() {
  const { state, setAnimationState } = useAnimationState();

  const applyTransform = useCallback(
    async (updates: Partial<TransformState>) => {
      const updatedKeyframes = updateKeyframesWithTransform({
        keyframes: state.keyframes,
        updates,
        currentTime: state.currentTime,
      });
      await setAnimationState({
        baseTransform: {
          ...state.baseTransform,
          ...updates,
        },
        keyframes: updatedKeyframes,
      });
    },
    [state, setAnimationState],
  );

  const addKeyframe = useCallback(
    async ({
      fieldName,
      value,
    }: {
      fieldName: KeyframeFieldName;
      value: number;
    }) => {
      const newKeyframes = addKeyframeTo({
        keyframes: state.keyframes[fieldName],
        time: state.currentTime,
        value,
      });
      await setAnimationState({
        keyframes: {
          ...state.keyframes,
          [fieldName]: newKeyframes,
        },
      });
    },
    [state, setAnimationState],
  );

  const removeKeyframe = useCallback(
    async (fieldName: KeyframeFieldName) => {
      const newKeyframes = removeKeyframeFrom({
        keyframes: state.keyframes[fieldName],
        time: state.currentTime,
      });
      await setAnimationState({
        keyframes: {
          ...state.keyframes,
          [fieldName]: newKeyframes,
        },
      });
    },
    [state, setAnimationState],
  );

  const transform = deriveTransformFromAnimationState({ state });
  const getKeyframeProps = useCallback(
    <T extends KeyframeFieldName>(fieldName: T) => {
      const value = transform[fieldName];
      const numericValue =
        typeof value === "boolean" ? (value ? 1 : 0) : Number(value);
      return {
        fieldName,
        value,
        onChange: (newValue: number | boolean) =>
          applyTransform({ [fieldName]: newValue }),
        onAddKeyframe: () => addKeyframe({ fieldName, value: numericValue }),
        onRemoveKeyframe: () => removeKeyframe(fieldName),
        hasKeyframe: hasKeyframeAtTime({
          keyframes: state.keyframes[fieldName],
          time: state.currentTime,
        }),
      };
    },
    [state, transform, addKeyframe, removeKeyframe, applyTransform],
  );

  const reset = useCallback(async () => {
    await setAnimationState(null);
  }, [setAnimationState]);

  return {
    animationState: state,
    setAnimationState,
    getKeyframeProps,
    reset,
  };
}
