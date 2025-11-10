import { useCallback, useEffect, useState } from "react";
import { sendGetAnimationStateMessage } from "@/src/feature/message/get-animation-state";
import { sendUpdateAnimationStateMessage } from "@/src/feature/message/update-animation-state";
import type {
  AnimationState,
  KeyframeFieldName,
  TransformState,
} from "./keyframe";
import {
  addKeyframeTo,
  DEFAULT_ANIMATION,
  deriveTransformFromAnimationState,
  removeKeyframeFrom,
  updateKeyframesWithTransform,
} from "./keyframe";

function useAnimationState() {
  const [state, setState] = useState<AnimationState | null>(null);

  useEffect(() => {
    (async () => {
      const response = await sendGetAnimationStateMessage();
      const animationState = response.animationState ?? null;
      setState(animationState);
    })();
  }, []);

  const setAnimationState = useCallback(
    async ({ newState }: { newState: AnimationState | null }) => {
      setState(newState);

      if (!newState) {
        await sendUpdateAnimationStateMessage(null, true);
        return;
      }

      await sendUpdateAnimationStateMessage(newState, true);
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
      const newState = {
        ...state,
        baseTransform: {
          ...state.baseTransform,
          ...updates,
        },
        keyframes: updatedKeyframes,
      };
      await setAnimationState({ newState });
    },
    [state, setAnimationState],
  );

  const updateAnimation = useCallback(
    async (updates: Partial<AnimationState>) => {
      await setAnimationState({
        newState: {
          ...state,
          ...updates,
        },
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
      await updateAnimation({
        keyframes: {
          ...state.keyframes,
          [fieldName]: newKeyframes,
        },
      });
    },
    [state, updateAnimation],
  );

  const removeKeyframe = useCallback(
    async (fieldName: KeyframeFieldName) => {
      const newKeyframes = removeKeyframeFrom({
        keyframes: state.keyframes[fieldName],
        time: state.currentTime,
      });
      await updateAnimation({
        keyframes: {
          ...state.keyframes,
          [fieldName]: newKeyframes,
        },
      });
    },
    [state, updateAnimation],
  );

  const resetAll = useCallback(async () => {
    await setAnimationState({ newState: null });
  }, [setAnimationState]);

  return {
    transform: deriveTransformFromAnimationState(state),
    animation: state,
    applyTransform,
    updateAnimation,
    addKeyframe,
    removeKeyframe,
    resetAll,
  };
}
