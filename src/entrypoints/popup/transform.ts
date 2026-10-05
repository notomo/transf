import { useCallback, useEffect, useState } from "react";
import type {
  AnimationState,
  KeyframeFieldName,
  KeyframeValue,
  TransformState,
} from "@/src/feature/animation-state";
import { DEFAULT_ANIMATION } from "@/src/feature/animation-state";
import {
  addKeyframeTo,
  deriveTransformFromAnimationState,
  hasKeyframeAtTime,
  removeKeyframeFrom,
} from "@/src/feature/keyframe";
import { sendGetAnimationStateMessage } from "@/src/feature/message/get-animation-state";
import { sendShowGizmoMessage } from "@/src/feature/message/show-gizmo";
import { sendUpdateAnimationStateMessage } from "@/src/feature/message/update-animation-state";
import { buildTransformUpdate } from "@/src/feature/transform-update";

function useAnimationState() {
  const [state, setState] = useState<AnimationState | null>(null);
  const [initialState, setInitialState] = useState<AnimationState | null>(null);

  const showGizmo = useCallback(async () => {
    const response = await sendShowGizmoMessage();
    setInitialState(response.initialAnimationState);
  }, []);

  useEffect(() => {
    (async () => {
      const response = await sendGetAnimationStateMessage();
      setState(response.animationState);
    })();
    showGizmo();
  }, [showGizmo]);

  const animationState = state ?? initialState ?? DEFAULT_ANIMATION;
  const setAnimationState = useCallback(
    async (updates: Partial<AnimationState | null>) => {
      if (updates === null) {
        setState(null);
        await sendUpdateAnimationStateMessage({ animationState: null });
        // Recreate the initial state at the current viewport.
        await showGizmo();
        return;
      }

      const merged = { ...animationState, ...updates };
      setState(merged);
      await sendUpdateAnimationStateMessage({
        // Send all fields for the first update so that the initial state is saved.
        animationState: state === null ? merged : updates,
      });
    },
    [animationState, state, showGizmo],
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
      await setAnimationState(
        buildTransformUpdate({ state: animationState, updates }),
      );
    },
    [animationState, setAnimationState],
  );

  const addKeyframe = useCallback(
    async ({
      fieldName,
      value,
    }: {
      fieldName: KeyframeFieldName;
      value: KeyframeValue;
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
      return {
        fieldName,
        value,
        onChange: (newValue: number | boolean) =>
          applyTransform({ [fieldName]: newValue }),
        onAddKeyframe: () => addKeyframe({ fieldName, value }),
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
