import { useEffect, useId, useRef } from "react";
import { useTransform } from "./transform";

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
      <label htmlFor={id} className="block select-none font-medium text-sm">
        {label}: {Math.round(value * 10) / 10}
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
  onAddKeyframe,
  onRemoveKeyframe,
  hasKeyframe,
}: {
  rotation: number;
  onChange: (value: number) => void;
  onAddKeyframe: () => void;
  onRemoveKeyframe: () => void;
  hasKeyframe: boolean;
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block select-none font-medium text-sm">
          Rotation (degrees): {Math.round(rotation * 10) / 10}
        </label>
        <button
          type="button"
          onClick={hasKeyframe ? onRemoveKeyframe : onAddKeyframe}
          className={`flex h-6 w-6 items-center justify-center rounded px-2 py-1 text-white text-xs ${
            hasKeyframe
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
          title={hasKeyframe ? "Remove keyframe" : "Add keyframe"}
        >
          {hasKeyframe ? "-" : "+"}
        </button>
      </div>
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
  onAddKeyframe,
  onRemoveKeyframe,
  hasKeyframe,
}: {
  scale: number;
  onChange: (value: number) => void;
  onAddKeyframe: () => void;
  onRemoveKeyframe: () => void;
  hasKeyframe: boolean;
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block select-none font-medium text-sm">
          Scale: {Math.round(scale * 100) / 100}x
        </label>
        <button
          type="button"
          onClick={hasKeyframe ? onRemoveKeyframe : onAddKeyframe}
          className={`flex h-6 w-6 items-center justify-center rounded px-2 py-1 text-white text-xs ${
            hasKeyframe
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
          title={hasKeyframe ? "Remove keyframe" : "Add keyframe"}
        >
          {hasKeyframe ? "-" : "+"}
        </button>
      </div>
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
  onAddKeyframe,
  onRemoveKeyframe,
  hasKeyframe,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onAddKeyframe: () => void;
  onRemoveKeyframe: () => void;
  hasKeyframe: boolean;
}) {
  const id = useId();
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block select-none font-medium text-sm">
          {label}: {Math.round(value)}px
        </label>
        <button
          type="button"
          onClick={hasKeyframe ? onRemoveKeyframe : onAddKeyframe}
          className={`flex h-6 w-6 items-center justify-center rounded px-2 py-1 text-white text-xs ${
            hasKeyframe
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
          title={hasKeyframe ? "Remove keyframe" : "Add keyframe"}
        >
          {hasKeyframe ? "-" : "+"}
        </button>
      </div>
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

function FlipCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center space-x-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
      <label htmlFor={id} className="font-medium text-sm">
        {label}
      </label>
    </div>
  );
}

function Timeline({
  animation,
  onUpdateAnimation,
}: {
  animation: ReturnType<typeof useTransform>["animation"];
  onUpdateAnimation: (
    updates: Partial<ReturnType<typeof useTransform>["animation"]>,
  ) => void;
}) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const durationId = useId();

  useEffect(() => {
    if (!animation.isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const startTime = Date.now() - animation.currentTime;

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = elapsed % animation.duration;

      onUpdateAnimation({ currentTime: progress });

      if (animation.isPlaying) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    animation.isPlaying,
    animation.duration,
    onUpdateAnimation,
    animation.currentTime,
  ]);

  const currentTimePercent = (animation.currentTime / animation.duration) * 100;

  const getAllKeyframeTimes = () => {
    const times = new Set<number>();
    Object.values(animation.keyframes).forEach((keyframes) => {
      for (const kf of keyframes) {
        times.add(kf.time);
      }
    });
    return Array.from(times).sort((a, b) => a - b);
  };

  const navigateToKeyframe = (direction: "prev" | "next") => {
    const allTimes = getAllKeyframeTimes();
    const currentTime = animation.currentTime;

    if (direction === "prev") {
      const prevTime = allTimes.filter((t) => t < currentTime).pop();
      if (prevTime !== undefined) {
        onUpdateAnimation({ currentTime: prevTime, isPlaying: false });
      }
    } else {
      const nextTime = allTimes.find((t) => t > currentTime);
      if (nextTime !== undefined) {
        onUpdateAnimation({ currentTime: nextTime, isPlaying: false });
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label htmlFor={durationId} className="block font-medium text-sm">
          Duration: {animation.duration}ms
        </label>
        <input
          id={durationId}
          type="range"
          min="50"
          max="10000"
          step="100"
          value={animation.duration}
          onChange={(e) =>
            onUpdateAnimation({ duration: Number(e.target.value) })
          }
          className="w-full"
        />
      </div>

      <div ref={timelineRef} className="relative">
        <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => navigateToKeyframe("prev")}
              className="flex h-full w-6 items-center justify-center rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() =>
                onUpdateAnimation({ isPlaying: !animation.isPlaying })
              }
              className="flex h-full w-6 items-center justify-center rounded bg-blue-500 px-3 py-1 text-white text-xs hover:bg-blue-600"
            >
              {animation.isPlaying ? "■" : "▶"}
            </button>
            <button
              type="button"
              onClick={() => navigateToKeyframe("next")}
              className="flex h-full w-6 items-center justify-center rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
            >
              →
            </button>
          </div>
          <div className="relative col-span-1 h-8 rounded bg-gray-100">
            <div
              className="absolute top-0 z-10 h-full w-0.5 bg-red-500"
              style={{ left: `${currentTimePercent}%` }}
            />

            <div className="absolute inset-0 flex items-center px-2">
              <input
                type="range"
                min="0"
                max={animation.duration}
                value={animation.currentTime}
                onChange={(e) =>
                  onUpdateAnimation({
                    currentTime: Number(e.target.value),
                    isPlaying: false,
                  })
                }
                className="w-full opacity-50"
              />
            </div>
          </div>
          {Object.entries(animation.keyframes).map(([property, keyframes]) => {
            if (keyframes.length === 0) return null;

            return (
              <>
                <span key={`${property}-label`} className="text-xs">
                  {property}
                </span>
                <div key={`${property}-timeline`} className="relative h-2">
                  {keyframes.map((kf, i) => (
                    <div
                      key={`${property}-${kf.time}-${i}`}
                      className="-translate-x-1 absolute h-2 w-2 transform rounded-full bg-blue-500"
                      style={{
                        left: `${(kf.time / animation.duration) * 100}%`,
                      }}
                    />
                  ))}
                </div>
              </>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function App() {
  const {
    transform,
    animation,
    applyTransform,
    updateAnimation,
    addKeyframe,
    removeKeyframe,
    resetAll,
  } = useTransform();

  return (
    <div className="w-128 space-y-3 p-4">
      <h1 className="text-center font-bold text-lg">Page Transform</h1>

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
        onAddKeyframe={() => addKeyframe("rotation", transform.rotation)}
        onRemoveKeyframe={() => removeKeyframe("rotation")}
        hasKeyframe={animation.keyframes.rotation.some(
          (kf) => kf.time === animation.currentTime,
        )}
      />

      <ScaleInput
        scale={transform.scale}
        onChange={(newValue) => applyTransform({ scale: newValue })}
        onAddKeyframe={() => addKeyframe("scale", transform.scale)}
        onRemoveKeyframe={() => removeKeyframe("scale")}
        hasKeyframe={animation.keyframes.scale.some(
          (kf) => kf.time === animation.currentTime,
        )}
      />

      <TranslateInput
        label="Translate X (px)"
        value={transform.translateX}
        onChange={(newValue) => applyTransform({ translateX: newValue })}
        onAddKeyframe={() => addKeyframe("translateX", transform.translateX)}
        onRemoveKeyframe={() => removeKeyframe("translateX")}
        hasKeyframe={animation.keyframes.translateX.some(
          (kf) => kf.time === animation.currentTime,
        )}
      />

      <TranslateInput
        label="Translate Y (px)"
        value={transform.translateY}
        onChange={(newValue) => applyTransform({ translateY: newValue })}
        onAddKeyframe={() => addKeyframe("translateY", transform.translateY)}
        onRemoveKeyframe={() => removeKeyframe("translateY")}
        hasKeyframe={animation.keyframes.translateY.some(
          (kf) => kf.time === animation.currentTime,
        )}
      />

      <div className="space-y-2">
        <FlipCheckbox
          label="Horizontal Flip"
          checked={transform.flipHorizontal}
          onChange={(checked) => applyTransform({ flipHorizontal: checked })}
        />
        <FlipCheckbox
          label="Vertical Flip"
          checked={transform.flipVertical}
          onChange={(checked) => applyTransform({ flipVertical: checked })}
        />
      </div>

      <Timeline animation={animation} onUpdateAnimation={updateAnimation} />

      <div className="flex justify-center">
        <button
          type="button"
          onClick={resetAll}
          className="rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-700"
        >
          Reset All
        </button>
      </div>
    </div>
  );
}
