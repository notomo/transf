import { useCallback, useId, useState } from "react";

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

export function App() {
  const [centerX, setCenterX] = useState(50);
  const [centerY, setCenterY] = useState(50);
  const [rotation, setRotation] = useState(0);

  const centerXId = useId();
  const centerYId = useId();
  const rotationId = useId();

  const applyTransform = useCallback(
    async (newCenterX: number, newCenterY: number, newRotation: number) => {
      const style = `
        transform-origin: ${newCenterX}% ${newCenterY}%;
        transform: rotate(${newRotation}deg);
        transition: transform 0.3s ease;
      `;
      applyCSS(style);
    },
    [],
  );

  const handleReset = async () => {
    applyCSS("");
    setCenterX(50);
    setCenterY(50);
    setRotation(0);
  };

  return (
    <div className="w-80 space-y-4 p-4">
      <h1 className="text-center font-bold text-lg">Page Rotation</h1>

      <div className="space-y-2">
        <label htmlFor={centerXId} className="block font-medium text-sm">
          Center X (%): {centerX}
        </label>
        <input
          id={centerXId}
          type="range"
          min="0"
          max="100"
          value={centerX}
          onChange={(e) => {
            const newValue = Number(e.target.value);
            setCenterX(newValue);
            applyTransform(newValue, centerY, rotation);
          }}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={centerYId} className="block font-medium text-sm">
          Center Y (%): {centerY}
        </label>
        <input
          id={centerYId}
          type="range"
          min="0"
          max="100"
          value={centerY}
          onChange={(e) => {
            const newValue = Number(e.target.value);
            setCenterY(newValue);
            applyTransform(centerX, newValue, rotation);
          }}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor={rotationId} className="block font-medium text-sm">
          Rotation (degrees): {rotation}
        </label>
        <input
          id={rotationId}
          type="range"
          min="-180"
          max="180"
          value={rotation}
          onChange={(e) => {
            const newValue = Number(e.target.value);
            setRotation(newValue);
            applyTransform(centerX, centerY, newValue);
          }}
          className="w-full"
        />
      </div>

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
