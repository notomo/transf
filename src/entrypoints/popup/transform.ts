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

// export to test only
export const transformStateItem = storage.defineItem<TransformState>(
  "session:transformState",
  {
    defaultValue: DEFAULT_TRANSFORM,
  },
);

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
  const [transform, setTransform] = useState(DEFAULT_TRANSFORM);

  useEffect(() => {
    const loadStored = async () => {
      const stored = await transformStateItem.getValue();
      setTransform(stored);
      applyTransformCSS(stored);
    };
    loadStored();
  }, []);

  const applyTransform = useCallback(
    async (updates: Partial<TransformState>) => {
      const newTransform = { ...transform, ...updates };
      setTransform(newTransform);
      await transformStateItem.setValue(newTransform);
      applyTransformCSS(newTransform);
    },
    [transform],
  );

  const resetTransform = useCallback(async () => {
    setTransform(DEFAULT_TRANSFORM);
    await transformStateItem.setValue(DEFAULT_TRANSFORM);
    applyCSS("");
  }, []);

  return {
    transform,
    applyTransform,
    resetTransform,
  };
}
