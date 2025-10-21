import { useCallback, useEffect, useState } from "react";
import { browser } from "wxt/browser";
import { storage } from "wxt/utils/storage";
import type { AnimationState, KeyframeFieldName } from "./keyframe";
import {
  addKeyframeTo,
  DEFAULT_TRANSFORM_VALUES,
  deriveTransformFromAnimationState,
  hasKeyframeAtTime,
  hasKeyframesForField,
  keyframeFieldNames,
  removeKeyframeFrom,
  updateKeyframe,
} from "./keyframe";

async function applyCSS(style: string) {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  const tabId = tab?.id;
  if (!tabId) {
    return;
  }

  await browser.scripting.executeScript({
    target: { tabId },
    args: [
      {
        style,
      },
    ],
    func: (args) => {
      document.documentElement.style.cssText = args.style;
    },
  });
}

async function applyTransformCSS(
  transform: TransformState | null,
  animated: boolean = false,
) {
  if (transform === null) {
    applyCSS("");
    return;
  }

  const scaleX = transform.flipHorizontal ? -transform.scale : transform.scale;
  const scaleY = transform.flipVertical ? -transform.scale : transform.scale;

  const style = `
transform-origin: ${transform.centerX}% ${transform.centerY}%;
transform: translate(${transform.translateX}px, ${transform.translateY}px) rotate(${transform.rotation}deg) scale(${scaleX}, ${scaleY});
${animated ? "" : "transition: transform 0.3s ease;"}
`;
  await applyCSS(style);
}

type TransformState = {
  centerX: number;
  centerY: number;
  rotation: number;
  scale: number;
  translateX: number;
  translateY: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
};

const DEFAULT_ANIMATION: AnimationState = {
  keyframes: {
    rotation: [],
    scale: [],
    translateX: [],
    translateY: [],
    centerX: [],
    centerY: [],
    flipHorizontal: [],
    flipVertical: [],
  },
  duration: 5000,
  isPlaying: false,
  currentTime: 0,
  baseTransform: { ...DEFAULT_TRANSFORM_VALUES },
};

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
      await applyTransformCSS(transform);
    })();
  }, []);

  const setAnimationState = useCallback(
    async (newState: AnimationState | null, animated: boolean = false) => {
      setState(newState);
      const transform = newState
        ? deriveTransformFromAnimationState(newState)
        : null;
      await applyTransformCSS(transform, animated);

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
    state,
    setAnimationState,
  };
}

export function useTransform() {
  const { state, setAnimationState } = useAnimationState();

  const currentState = state ?? DEFAULT_ANIMATION;

  const getAnimatedTransform = useCallback(
    (time: number): TransformState => {
      const tempState = { ...currentState, currentTime: time };
      return deriveTransformFromAnimationState(tempState);
    },
    [currentState],
  );

  const applyTransform = useCallback(
    async (updates: Partial<TransformState>) => {
      const updatedKeyframes = { ...currentState.keyframes };
      const currentTime = currentState.currentTime;

      for (const field of keyframeFieldNames) {
        const value = updates[field];
        if (value === undefined) {
          continue;
        }

        const keyframes = updatedKeyframes[field];

        // Skip if no keyframes exist for this field
        if (!hasKeyframesForField(keyframes)) {
          continue;
        }

        const numericValue =
          typeof value === "boolean" ? (value ? 1 : 0) : value;

        // If keyframes exist for this field but none at current time, add new keyframe
        if (!hasKeyframeAtTime(keyframes, currentTime)) {
          updatedKeyframes[field] = addKeyframeTo(
            keyframes,
            currentTime,
            numericValue,
          );
        } else {
          // Update existing keyframe
          updatedKeyframes[field] = updateKeyframe(
            keyframes,
            currentTime,
            numericValue,
          );
        }
      }

      const newState = {
        ...currentState,
        baseTransform: {
          ...currentState.baseTransform,
          ...updates,
        },
        keyframes: updatedKeyframes,
      };

      await setAnimationState(newState);
    },
    [currentState, setAnimationState],
  );

  const updateAnimation = useCallback(
    async (updates: Partial<AnimationState>) => {
      const newState = {
        ...currentState,
        ...updates,
      };

      await setAnimationState(newState, newState.isPlaying);
    },
    [currentState, setAnimationState],
  );

  const addKeyframe = useCallback(
    async (fieldName: KeyframeFieldName, value: number) => {
      const time = currentState.currentTime;
      const existingKeyframes = currentState.keyframes[fieldName];
      const newKeyframes = addKeyframeTo(existingKeyframes, time, value);

      await updateAnimation({
        keyframes: {
          ...currentState.keyframes,
          [fieldName]: newKeyframes,
        },
      });
    },
    [currentState, updateAnimation],
  );

  const removeKeyframe = useCallback(
    async (fieldName: KeyframeFieldName) => {
      const time = currentState.currentTime;
      const existingKeyframes = currentState.keyframes[fieldName];
      const newKeyframes = removeKeyframeFrom(existingKeyframes, time);

      await updateAnimation({
        keyframes: {
          ...currentState.keyframes,
          [fieldName]: newKeyframes,
        },
      });
    },
    [currentState, updateAnimation],
  );

  const resetAll = useCallback(async () => {
    await setAnimationState(null);
  }, [setAnimationState]);

  const transform: TransformState =
    deriveTransformFromAnimationState(currentState);

  return {
    transform,
    animation: currentState,
    applyTransform,
    updateAnimation,
    addKeyframe,
    removeKeyframe,
    resetAll,
    getAnimatedTransform,
  };
}
