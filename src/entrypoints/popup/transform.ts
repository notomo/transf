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

  const animationState = state ?? DEFAULT_ANIMATION;
  const setAnimationState = useCallback(
    async (updates: Partial<AnimationState | null>) => {
      if (updates !== null) {
        setState({
          ...animationState,
          ...updates,
        });
      } else {
        setState(null);
      }
      await sendUpdateAnimationStateMessage({
        animationState: updates,
      });
    },
    [animationState],
  );

  return {
    animationState,
    setAnimationState,
  };
}

export function useTransform() {
  const { animationState, setAnimationState } = useAnimationState();

  const applyTransform = useCallback(
    async (updates: Partial<TransformState>) => {
      const updatedKeyframes = updateKeyframesWithTransform({
        keyframes: animationState.keyframes,
        updates,
        currentTime: animationState.currentTime,
      });
      await setAnimationState({
        baseTransform: {
          ...animationState.baseTransform,
          ...updates,
        },
        keyframes: updatedKeyframes,
      });
    },
    [animationState, setAnimationState],
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
        keyframes: animationState.keyframes[fieldName],
        time: animationState.currentTime,
        value,
      });
      await setAnimationState({
        keyframes: {
          ...animationState.keyframes,
          [fieldName]: newKeyframes,
        },
      });
    },
    [animationState, setAnimationState],
  );

  const removeKeyframe = useCallback(
    async (fieldName: KeyframeFieldName) => {
      const newKeyframes = removeKeyframeFrom({
        keyframes: animationState.keyframes[fieldName],
        time: animationState.currentTime,
      });
      await setAnimationState({
        keyframes: {
          ...animationState.keyframes,
          [fieldName]: newKeyframes,
        },
      });
    },
    [animationState, setAnimationState],
  );

  const transform = deriveTransformFromAnimationState({
    state: animationState,
  });
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
          keyframes: animationState.keyframes[fieldName],
          time: animationState.currentTime,
        }),
      };
    },
    [animationState, transform, addKeyframe, removeKeyframe, applyTransform],
  );

  const reset = useCallback(async () => {
    await setAnimationState(null);
  }, [setAnimationState]);

  return {
    animationState,
    setAnimationState,
    getKeyframeProps,
    reset,
  };
}
