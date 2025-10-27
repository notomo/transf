import { useCallback, useEffect, useState } from "react";
import { browser } from "wxt/browser";
import { storage } from "wxt/utils/storage";
import {
  type AnimationStateResponseMessage,
  createGetAnimationStateMessage,
  createResetAnimationMessage,
  createStartAnimationMessage,
  createUpdateAnimationStateMessage,
  validateMessage,
} from "@/src/feature/message";
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
      const tabId = tab?.id;
      if (!url || !tabId) {
        return;
      }
      setUrl(url);

      // Get animation state from background script
      try {
        const response = await browser.runtime.sendMessage(
          createGetAnimationStateMessage(),
        );
        const validatedResponse = validateMessage(
          response,
        ) as AnimationStateResponseMessage;
        const animationState = validatedResponse.animationState ?? null;
        setState(animationState);
      } catch (error) {
        console.debug(
          "Could not get animation state from background script:",
          error,
        );
        // Fallback to storage
        const stored = await animationStates.getValue();
        const animationState = stored[url] ?? null;
        setState(animationState);
      }
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

      try {
        if (newState) {
          if (animated && newState.isPlaying) {
            await browser.runtime.sendMessage(
              createStartAnimationMessage(newState),
            );
          } else {
            await browser.runtime.sendMessage(
              createUpdateAnimationStateMessage(newState),
            );
          }
        } else {
          await browser.runtime.sendMessage(createResetAnimationMessage());
        }
      } catch (error) {
        console.debug("Could not send message to background script:", error);
      }

      // Also save to storage as backup
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
