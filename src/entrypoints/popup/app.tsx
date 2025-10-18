import { useId } from "react";
import { cn } from "@/src/lib/tailwind";
import { hasKeyframeAtTime, keyframeFieldLabels } from "./keyframe";
import { Timeline } from "./timeline";
import { useTransform } from "./transform";

function KeyframeButton({
  hasKeyframe,
  onAddKeyframe,
  onRemoveKeyframe,
  name,
}: {
  hasKeyframe: boolean;
  onAddKeyframe: () => void;
  onRemoveKeyframe: () => void;
  name: string;
}) {
  return (
    <button
      type="button"
      onClick={hasKeyframe ? onRemoveKeyframe : onAddKeyframe}
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded px-2 py-1 font-bold text-lg text-white",
        hasKeyframe
          ? "bg-red-500 hover:bg-red-600"
          : "bg-green-500 hover:bg-green-600",
      )}
      title={hasKeyframe ? `Remove ${name} keyframe` : `Add ${name} keyframe`}
    >
      {hasKeyframe ? "-" : "+"}
    </button>
  );
}

function DurationInput({
  duration,
  onDurationChange,
  className,
}: {
  duration: number;
  onDurationChange: (duration: number) => void;
  className?: string;
}) {
  const durationId = useId();
  return (
    <div className={className}>
      <label htmlFor={durationId} className="block font-medium text-sm">
        Duration: {duration}ms
      </label>
      <input
        id={durationId}
        type="range"
        min="50"
        max="10000"
        step="50"
        value={duration}
        onChange={(e) => onDurationChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

function AxisPercentInput({
  fieldName,
  value,
  onChange,
  onAddKeyframe,
  onRemoveKeyframe,
  hasKeyframe,
}: {
  fieldName: "centerX" | "centerY";
  value: number;
  onChange: (value: number) => void;
  onAddKeyframe: () => void;
  onRemoveKeyframe: () => void;
  hasKeyframe: boolean;
}) {
  const id = useId();
  const label = keyframeFieldLabels[fieldName];
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block select-none font-medium text-sm">
          {label}: {Math.round(value * 10) / 10}%
        </label>
        <KeyframeButton
          hasKeyframe={hasKeyframe}
          onAddKeyframe={onAddKeyframe}
          onRemoveKeyframe={onRemoveKeyframe}
          name={label}
        />
      </div>
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
  className,
}: {
  rotation: number;
  onChange: (value: number) => void;
  onAddKeyframe: () => void;
  onRemoveKeyframe: () => void;
  hasKeyframe: boolean;
  className?: string;
}) {
  const id = useId();
  const label = keyframeFieldLabels["rotation"];
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block select-none font-medium text-sm">
          {label}: {Math.round(rotation * 10) / 10}°
        </label>
        <KeyframeButton
          hasKeyframe={hasKeyframe}
          onAddKeyframe={onAddKeyframe}
          onRemoveKeyframe={onRemoveKeyframe}
          name={label}
        />
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
  className,
}: {
  scale: number;
  onChange: (value: number) => void;
  onAddKeyframe: () => void;
  onRemoveKeyframe: () => void;
  hasKeyframe: boolean;
  className?: string;
}) {
  const id = useId();
  const label = keyframeFieldLabels["scale"];
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block select-none font-medium text-sm">
          {label}: {Math.round(scale * 100) / 100}x
        </label>
        <KeyframeButton
          hasKeyframe={hasKeyframe}
          onAddKeyframe={onAddKeyframe}
          onRemoveKeyframe={onRemoveKeyframe}
          name={label}
        />
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
  fieldName,
  value,
  onChange,
  onAddKeyframe,
  onRemoveKeyframe,
  hasKeyframe,
}: {
  fieldName: "translateX" | "translateY";
  value: number;
  onChange: (value: number) => void;
  onAddKeyframe: () => void;
  onRemoveKeyframe: () => void;
  hasKeyframe: boolean;
}) {
  const id = useId();
  const label = keyframeFieldLabels[fieldName];
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block select-none font-medium text-sm">
          {label}: {Math.round(value)}px
        </label>
        <KeyframeButton
          hasKeyframe={hasKeyframe}
          onAddKeyframe={onAddKeyframe}
          onRemoveKeyframe={onRemoveKeyframe}
          name={label}
        />
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
  fieldName,
  checked,
  onChange,
  onAddKeyframe,
  onRemoveKeyframe,
  hasKeyframe,
}: {
  fieldName: "flipVertical" | "flipHorizontal";
  checked: boolean;
  onChange: (checked: boolean) => void;
  onAddKeyframe: () => void;
  onRemoveKeyframe: () => void;
  hasKeyframe: boolean;
}) {
  const id = useId();
  const label = keyframeFieldLabels[fieldName];
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor={id} className="select-none font-medium text-sm">
          {label}
        </label>
      </div>
      <KeyframeButton
        hasKeyframe={hasKeyframe}
        onAddKeyframe={onAddKeyframe}
        onRemoveKeyframe={onRemoveKeyframe}
        name={label}
      />
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
    <div className="w-128 border border-gray-200 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="flex-1 text-center font-bold text-xl">Page Transform</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetAll}
            className="rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-700"
          >
            Reset
          </button>
          <a
            href={`chrome-extension://${browser.runtime.id}/popup.html`}
            target="_blank"
            className="rounded border px-4 py-2"
          >
            Dev
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <TranslateInput
          fieldName="translateX"
          value={transform.translateX}
          onChange={(newValue) => applyTransform({ translateX: newValue })}
          onAddKeyframe={() => addKeyframe("translateX", transform.translateX)}
          onRemoveKeyframe={() => removeKeyframe("translateX")}
          hasKeyframe={hasKeyframeAtTime(
            animation.keyframes.translateX,
            animation.currentTime,
          )}
        />

        <TranslateInput
          fieldName="translateY"
          value={transform.translateY}
          onChange={(newValue) => applyTransform({ translateY: newValue })}
          onAddKeyframe={() => addKeyframe("translateY", transform.translateY)}
          onRemoveKeyframe={() => removeKeyframe("translateY")}
          hasKeyframe={hasKeyframeAtTime(
            animation.keyframes.translateY,
            animation.currentTime,
          )}
        />

        <AxisPercentInput
          fieldName="centerX"
          value={transform.centerX}
          onChange={(newValue) => applyTransform({ centerX: newValue })}
          onAddKeyframe={() => addKeyframe("centerX", transform.centerX)}
          onRemoveKeyframe={() => removeKeyframe("centerX")}
          hasKeyframe={hasKeyframeAtTime(
            animation.keyframes.centerX,
            animation.currentTime,
          )}
        />

        <AxisPercentInput
          fieldName="centerY"
          value={transform.centerY}
          onChange={(newValue) => applyTransform({ centerY: newValue })}
          onAddKeyframe={() => addKeyframe("centerY", transform.centerY)}
          onRemoveKeyframe={() => removeKeyframe("centerY")}
          hasKeyframe={hasKeyframeAtTime(
            animation.keyframes.centerY,
            animation.currentTime,
          )}
        />

        <RotationInput
          className="col-span-2"
          rotation={transform.rotation}
          onChange={(newValue) => applyTransform({ rotation: newValue })}
          onAddKeyframe={() => addKeyframe("rotation", transform.rotation)}
          onRemoveKeyframe={() => removeKeyframe("rotation")}
          hasKeyframe={hasKeyframeAtTime(
            animation.keyframes.rotation,
            animation.currentTime,
          )}
        />

        <ScaleInput
          className="col-span-2"
          scale={transform.scale}
          onChange={(newValue) => applyTransform({ scale: newValue })}
          onAddKeyframe={() => addKeyframe("scale", transform.scale)}
          onRemoveKeyframe={() => removeKeyframe("scale")}
          hasKeyframe={hasKeyframeAtTime(
            animation.keyframes.scale,
            animation.currentTime,
          )}
        />

        <FlipCheckbox
          fieldName="flipHorizontal"
          checked={transform.flipHorizontal}
          onChange={(checked) => applyTransform({ flipHorizontal: checked })}
          onAddKeyframe={() =>
            addKeyframe("flipHorizontal", transform.flipHorizontal ? 1 : 0)
          }
          onRemoveKeyframe={() => removeKeyframe("flipHorizontal")}
          hasKeyframe={hasKeyframeAtTime(
            animation.keyframes.flipHorizontal,
            animation.currentTime,
          )}
        />

        <FlipCheckbox
          fieldName="flipVertical"
          checked={transform.flipVertical}
          onChange={(checked) => applyTransform({ flipVertical: checked })}
          onAddKeyframe={() =>
            addKeyframe("flipVertical", transform.flipVertical ? 1 : 0)
          }
          onRemoveKeyframe={() => removeKeyframe("flipVertical")}
          hasKeyframe={hasKeyframeAtTime(
            animation.keyframes.flipVertical,
            animation.currentTime,
          )}
        />

        <div className="col-span-2 space-y-2 bg-gray-100 px-1 py-2">
          <Timeline animation={animation} onUpdateAnimation={updateAnimation} />

          <DurationInput
            duration={animation.duration}
            onDurationChange={(duration) => updateAnimation({ duration })}
          />
        </div>
      </div>
    </div>
  );
}
