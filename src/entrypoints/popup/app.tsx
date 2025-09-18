import { useCallback, useEffect, useId, useState } from "react";
import {
  DEFAULT_TRANSFORM,
  getTransformState,
  setTransformState,
  type TransformState,
} from "./storage";

function AxisPercentInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-medium text-sm">
        {label}: {value}
      </label>
      <input
        id={id}
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => {
          const newValue = Number(e.target.value);
          onChange(newValue);
        }}
        className="w-full"
      />
    </div>
  );
}

function RotationInput({
  rotation,
  onChange,
}: {
  rotation: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-medium text-sm">
        Rotation (degrees): {rotation}
      </label>
      <input
        id={id}
        type="range"
        min="-180"
        max="180"
        value={rotation}
        onChange={(e) => {
          const newValue = Number(e.target.value);
          onChange(newValue);
        }}
        className="w-full"
      />
    </div>
  );
}

function ScaleInput({
  scale,
  onChange,
}: {
  scale: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-medium text-sm">
        Scale: {scale}x
      </label>
      <input
        id={id}
        type="range"
        min="0.1"
        max="5"
        step="0.1"
        value={scale}
        onChange={(e) => {
          const newValue = Number(e.target.value);
          onChange(newValue);
        }}
        className="w-full"
      />
    </div>
  );
}

function TranslateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-medium text-sm">
        {label}: {value}px
      </label>
      <input
        id={id}
        type="range"
        min="-5000"
        max="5000"
        value={value}
        onChange={(e) => {
          const newValue = Number(e.target.value);
          onChange(newValue);
        }}
        className="w-full"
      />
    </div>
  );
}

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

export function App() {
  const [transform, setTransform] = useState<TransformState>(DEFAULT_TRANSFORM);

  useEffect(() => {
    const loadStoredState = async () => {
      const stored = await getTransformState();
      setTransform(stored);
      applyTransformCSS(stored);
    };
    loadStoredState();
  }, []);

  const applyTransform = useCallback(
    async (updates: Partial<TransformState>) => {
      const newTransform = { ...transform, ...updates };
      setTransform(newTransform);
      await setTransformState(newTransform);
      applyTransformCSS(newTransform);
    },
    [transform],
  );

  const handleReset = async () => {
    setTransform(DEFAULT_TRANSFORM);
    await setTransformState(DEFAULT_TRANSFORM);
    applyCSS("");
  };

  return (
    <div className="w-80 space-y-4 p-4">
      <h1 className="text-center font-bold text-lg">Page Rotation</h1>

      <AxisPercentInput
        label="Center X (%)"
        value={transform.centerX}
        onChange={(newValue) => applyTransform({ centerX: newValue })}
      />

      <AxisPercentInput
        label="Center Y (%)"
        value={transform.centerY}
        onChange={(newValue) => applyTransform({ centerY: newValue })}
      />

      <RotationInput
        rotation={transform.rotation}
        onChange={(newValue) => applyTransform({ rotation: newValue })}
      />

      <ScaleInput
        scale={transform.scale}
        onChange={(newValue) => applyTransform({ scale: newValue })}
      />

      <TranslateInput
        label="Translate X (px)"
        value={transform.translateX}
        onChange={(newValue) => applyTransform({ translateX: newValue })}
      />

      <TranslateInput
        label="Translate Y (px)"
        value={transform.translateY}
        onChange={(newValue) => applyTransform({ translateY: newValue })}
      />

      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleReset}
          className="rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
