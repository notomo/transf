import { useCallback, useEffect, useState } from "react";
import { browser } from "wxt/browser";
import { storage } from "wxt/utils/storage";
import type { AnimationState, KeyframeFieldName } from "./keyframe";
import {
  addKeyframeTo,
  interpolateKeyframes,
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

type ExtendedState = {
  transform: TransformState;
  animation: AnimationState;
};

const DEFAULT_TRANSFORM: TransformState = {
  centerX: 50,
  centerY: 50,
  rotation: 0,
  scale: 1,
  translateX: 0,
  translateY: 0,
  flipHorizontal: false,
  flipVertical: false,
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
};

const extendedStates = storage.defineItem<Record<string, ExtendedState>>(
  "local:extendedStates",
  {
    defaultValue: {},
  },
);

function useExtendedState() {
  const [state, setState] = useState<ExtendedState | null>(null);
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

      const stored = await extendedStates.getValue();
      const extendedState = stored[url] ?? null;
      setState(extendedState);
      await applyTransformCSS(extendedState?.transform ?? null);
    })();
  }, []);

  const setExtendedState = useCallback(
    async (newState: ExtendedState | null, animated: boolean = false) => {
      setState(newState);
      await applyTransformCSS(newState?.transform ?? null, animated);

      const stored = await extendedStates.getValue();
      if (newState) {
        await extendedStates.setValue({
          ...stored,
          [url]: newState,
        });
        return;
      }

      const states = { ...stored };
      delete states[url];
      await extendedStates.setValue(states);
    },
    [url],
  );

  return {
    state,
    setExtendedState,
  };
}

export function useTransform() {
  const { state, setExtendedState } = useExtendedState();

  const currentState = state ?? {
    transform: DEFAULT_TRANSFORM,
    animation: DEFAULT_ANIMATION,
  };

  const getAnimatedTransform = useCallback(
    (time: number): TransformState => {
      const { animation, transform } = currentState;

      return {
        ...transform,
        rotation: interpolateKeyframes(
          animation.keyframes.rotation,
          time,
          transform.rotation,
        ),
        scale: interpolateKeyframes(
          animation.keyframes.scale,
          time,
          transform.scale,
        ),
        translateX: interpolateKeyframes(
          animation.keyframes.translateX,
          time,
          transform.translateX,
        ),
        translateY: interpolateKeyframes(
          animation.keyframes.translateY,
          time,
          transform.translateY,
        ),
        centerX: interpolateKeyframes(
          animation.keyframes.centerX,
          time,
          transform.centerX,
        ),
        centerY: interpolateKeyframes(
          animation.keyframes.centerY,
          time,
          transform.centerY,
        ),
        flipHorizontal:
          interpolateKeyframes(
            animation.keyframes.flipHorizontal,
            time,
            transform.flipHorizontal ? 1 : 0,
          ) > 0.5,
        flipVertical:
          interpolateKeyframes(
            animation.keyframes.flipVertical,
            time,
            transform.flipVertical ? 1 : 0,
          ) > 0.5,
      };
    },
    [currentState],
  );

  const applyTransform = useCallback(
    async (updates: Partial<TransformState>) => {
      const newTransform = {
        ...currentState.transform,
        ...updates,
      };
      const newState = {
        ...currentState,
        transform: newTransform,
      };

      const updatedKeyframes = { ...currentState.animation.keyframes };
      const currentTime = currentState.animation.currentTime;
      let hasKeyframeUpdates = false;
      for (const field of keyframeFieldNames) {
        const value = updates[field];
        if (value === undefined) {
          continue;
        }

        const keyframes = updatedKeyframes[field];
        if (keyframes.length === 0) {
          continue;
        }

        const existingKeyframeIndex = keyframes.findIndex(
          (kf) => kf.time === currentTime,
        );
        if (existingKeyframeIndex !== -1) {
          const numericValue =
            typeof value === "boolean" ? (value ? 1 : 0) : value;
          updatedKeyframes[field] = updateKeyframe(
            keyframes,
            currentTime,
            numericValue,
          );
          hasKeyframeUpdates = true;
        }
      }

      if (hasKeyframeUpdates) {
        const finalState = {
          ...newState,
          animation: {
            ...currentState.animation,
            keyframes: updatedKeyframes,
          },
        };
        await setExtendedState(finalState);
      } else {
        await setExtendedState(newState);
      }
    },
    [currentState, setExtendedState],
  );

  const updateAnimation = useCallback(
    async (updates: Partial<AnimationState>) => {
      const newAnimation = {
        ...currentState.animation,
        ...updates,
      };
      const newState = {
        ...currentState,
        animation: newAnimation,
      };

      if (updates.currentTime !== undefined && newAnimation.isPlaying) {
        const animatedTransform = getAnimatedTransform(updates.currentTime);
        const finalState = {
          ...newState,
          transform: animatedTransform,
        };
        await setExtendedState(finalState, true);
      } else {
        await setExtendedState(newState);
      }
    },
    [currentState, setExtendedState, getAnimatedTransform],
  );

  const addKeyframe = useCallback(
    async (property: KeyframeFieldName, value: number) => {
      const time = currentState.animation.currentTime;
      const existingKeyframes = currentState.animation.keyframes[property];
      const newKeyframes = addKeyframeTo(existingKeyframes, time, value);

      await updateAnimation({
        keyframes: {
          ...currentState.animation.keyframes,
          [property]: newKeyframes,
        },
      });
    },
    [currentState.animation, updateAnimation],
  );

  const removeKeyframe = useCallback(
    async (property: KeyframeFieldName) => {
      const time = currentState.animation.currentTime;
      const existingKeyframes = currentState.animation.keyframes[property];
      const newKeyframes = removeKeyframeFrom(existingKeyframes, time);

      await updateAnimation({
        keyframes: {
          ...currentState.animation.keyframes,
          [property]: newKeyframes,
        },
      });
    },
    [currentState.animation, updateAnimation],
  );

  const resetAll = useCallback(async () => {
    await setExtendedState(null);
  }, [setExtendedState]);

  return {
    transform: currentState.transform,
    animation: currentState.animation,
    applyTransform,
    updateAnimation,
    addKeyframe,
    removeKeyframe,
    resetAll,
    getAnimatedTransform,
  };
}
