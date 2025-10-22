import { useCallback, useEffect, useState } from "react";
import { browser } from "wxt/browser";
import { storage } from "wxt/utils/storage";
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
import { applyTransformCSS } from "./style";

const animationStates = storage.defineItem<Record<string, AnimationState>>(
  "local:animationStates",
  {
    defaultValue: {},
  },
);

function useAnimationState() {
  const [state, setState] = useState<AnimationState | null>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    (async () => {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      const url = tab?.url;
      if (!url) {
        return;
      }
      setUrl(url);

      const stored = await animationStates.getValue();
      const animationState = stored[url] ?? null;
      setState(animationState);

      const transform = animationState
        ? deriveTransformFromAnimationState(animationState)
        : null;
      await applyTransformCSS({ transform });
    })();
  }, []);

  const setAnimationState = useCallback(
    async ({
      newState,
      animated = false,
    }: {
      newState: AnimationState | null;
      animated?: boolean;
    }) => {
      setState(newState);

      const transform = newState
        ? deriveTransformFromAnimationState(newState)
        : null;
      await applyTransformCSS({ transform, animated });

      const stored = await animationStates.getValue();
      if (newState) {
        await animationStates.setValue({
          ...stored,
          [url]: newState,
        });
        return;
      }

      const states = { ...stored };
      delete states[url];
      await animationStates.setValue(states);
    },
    [url],
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
      const newState = {
        ...state,
        ...updates,
      };
      await setAnimationState({ newState, animated: newState.isPlaying });
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
