import { useCallback, useEffect, useState } from "react";
import { browser } from "wxt/browser";
import { storage } from "wxt/utils/storage";

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

async function applyTransformCSS(transform: TransformState | null) {
  if (transform === null) {
    applyCSS("");
    return;
  }

  const style = `
transform-origin: ${transform.centerX}% ${transform.centerY}%;
transform: translate(${transform.translateX}px, ${transform.translateY}px) rotate(${transform.rotation}deg) scale(${transform.scale});
transition: transform 0.3s ease;
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
};

const DEFAULT_TRANSFORM: TransformState = {
  centerX: 50,
  centerY: 50,
  rotation: 0,
  scale: 1,
  translateX: 0,
  translateY: 0,
};

const transformStates = storage.defineItem<Record<string, TransformState>>(
  "session:transformStates",
  {
    defaultValue: {},
  },
);

function useTransformState() {
  const [transform, set] = useState<TransformState | null>(null);
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

      const stored = await transformStates.getValue();
      const state = stored[url] ?? null;
      set(state);
      await applyTransformCSS(state);
    })();
  }, []);

  const setTransform = useCallback(
    async (state: TransformState | null) => {
      set(state);
      await applyTransformCSS(state);

      const stored = await transformStates.getValue();
      if (state) {
        await transformStates.setValue({
          ...stored,
          [url]: state,
        });
        return;
      }

      const states = { ...stored };
      delete states[url];
      await transformStates.setValue(states);
    },
    [url],
  );

  return {
    transform,
    setTransform,
  };
}

export function useTransform() {
  const { transform, setTransform } = useTransformState();

  const applyTransform = useCallback(
    async (updates: Partial<TransformState>) => {
      const newTransform = {
        ...(transform ?? DEFAULT_TRANSFORM),
        ...updates,
      };
      setTransform(newTransform);
    },
    [transform, setTransform],
  );

  const resetTransform = useCallback(async () => {
    setTransform(null);
  }, [setTransform]);

  return {
    transform: transform ?? DEFAULT_TRANSFORM,
    applyTransform,
    resetTransform,
  };
}
