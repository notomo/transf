import { useCallback, useEffect, useState } from "react";
import { browser } from "wxt/browser";
import { storage } from "wxt/utils/storage";

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

export const transformStateItem = storage.defineItem<
  Record<string, TransformState>
>("session:transformStates", {
  defaultValue: {},
});

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

function applyTransformCSS(transform: TransformState) {
  const style = `
transform-origin: ${transform.centerX}% ${transform.centerY}%;
transform: translate(${transform.translateX}px, ${transform.translateY}px) rotate(${transform.rotation}deg) scale(${transform.scale});
transition: transform 0.3s ease;
`;
  applyCSS(style);
}

export function useTransform() {
  const [transform, setTransform] = useState<TransformState | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>("");

  useEffect(() => {
    const loadStored = async () => {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      const url = tab?.url;
      if (!url) return;

      setCurrentUrl(url);
      const storedStates = await transformStateItem.getValue();
      const urlState = storedStates[url];

      if (urlState) {
        setTransform(urlState);
        applyTransformCSS(urlState);
      } else {
        setTransform(null);
        applyCSS("");
      }
    };
    loadStored();
  }, []);

  const applyTransform = useCallback(
    async (updates: Partial<TransformState>) => {
      if (!currentUrl) return;

      const currentTransform = transform || DEFAULT_TRANSFORM;
      const newTransform = { ...currentTransform, ...updates };
      setTransform(newTransform);

      const storedStates = await transformStateItem.getValue();
      await transformStateItem.setValue({
        ...storedStates,
        [currentUrl]: newTransform,
      });
      applyTransformCSS(newTransform);
    },
    [transform, currentUrl],
  );

  const resetTransform = useCallback(async () => {
    if (!currentUrl) return;

    setTransform(null);
    const storedStates = await transformStateItem.getValue();
    const newStates = { ...storedStates };
    delete newStates[currentUrl];
    await transformStateItem.setValue(newStates);
    applyCSS("");
  }, [currentUrl]);

  return {
    transform: transform || DEFAULT_TRANSFORM,
    applyTransform,
    resetTransform,
  };
}
