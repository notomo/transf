import { useId } from "react";
import { cn } from "@/src/lib/tailwind";
import { hasKeyframeAtTime } from "./keyframe";
import { Timeline } from "./timeline";
import { useTransform } from "./transform";

function KeyframeButton({
  hasKeyframe,
  onAddKeyframe,
  onRemoveKeyframe,
  property,
}: {
  hasKeyframe: boolean;
  onAddKeyframe: () => void;
  onRemoveKeyframe: () => void;
  property: string;
}) {
  return (
    <button
      type="button"
      onClick={hasKeyframe ? onRemoveKeyframe : onAddKeyframe}
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded px-2 py-1 text-white text-xs",
        hasKeyframe
          ? "bg-red-500 hover:bg-red-600"
          : "bg-green-500 hover:bg-green-600",
      )}
      title={
        hasKeyframe ? `Remove ${property} keyframe` : `Add ${property} keyframe`
      }
    >
      {hasKeyframe ? "-" : "+"}
    </button>
  );
}

function DurationInput({
  duration,
  onDurationChange,
}: {
  duration: number;
  onDurationChange: (duration: number) => void;
}) {
  const durationId = useId();
  return (
    <div>
      <label htmlFor={durationId} className="block font-medium text-sm">
        Duration: {duration}ms
      </label>
      <input
        id={durationId}
        type="range"
        min="50"
        max="10000"
        step="100"
        value={duration}
        onChange={(e) => onDurationChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

function AxisPercentInput({
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
  onAddKeyframe?: () => void;
  onRemoveKeyframe?: () => void;
  hasKeyframe?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block select-none font-medium text-sm">
          {label}: {Math.round(value * 10) / 10}%
        </label>
        {onAddKeyframe && onRemoveKeyframe && hasKeyframe !== undefined && (
          <KeyframeButton
            hasKeyframe={hasKeyframe}
            onAddKeyframe={onAddKeyframe}
            onRemoveKeyframe={onRemoveKeyframe}
            property={label}
          />
        )}
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
}: {
  rotation: number;
  onChange: (value: number) => void;
  onAddKeyframe: () => void;
  onRemoveKeyframe: () => void;
  hasKeyframe: boolean;
}) {
  const id = useId();
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block select-none font-medium text-sm">
          Rotation: {Math.round(rotation * 10) / 10}°
        </label>
        <KeyframeButton
          hasKeyframe={hasKeyframe}
          onAddKeyframe={onAddKeyframe}
          onRemoveKeyframe={onRemoveKeyframe}
          property="Rotation"
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
}: {
  scale: number;
  onChange: (value: number) => void;
  onAddKeyframe: () => void;
  onRemoveKeyframe: () => void;
  hasKeyframe: boolean;
}) {
  const id = useId();
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block select-none font-medium text-sm">
          Scale: {Math.round(scale * 100) / 100}x
        </label>
        <KeyframeButton
          hasKeyframe={hasKeyframe}
          onAddKeyframe={onAddKeyframe}
          onRemoveKeyframe={onRemoveKeyframe}
          property="Scale"
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
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block select-none font-medium text-sm">
          {label}: {Math.round(value)}px
        </label>
        <KeyframeButton
          hasKeyframe={hasKeyframe}
          onAddKeyframe={onAddKeyframe}
          onRemoveKeyframe={onRemoveKeyframe}
          property={label}
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
  label,
  checked,
  onChange,
  onAddKeyframe,
  onRemoveKeyframe,
  hasKeyframe,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onAddKeyframe?: () => void;
  onRemoveKeyframe?: () => void;
  hasKeyframe?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between space-x-2">
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
      {onAddKeyframe && onRemoveKeyframe && hasKeyframe !== undefined && (
        <KeyframeButton
          hasKeyframe={hasKeyframe}
          onAddKeyframe={onAddKeyframe}
          onRemoveKeyframe={onRemoveKeyframe}
          property={label}
        />
      )}
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
    <div className="w-128 space-y-2 border border-gray-200 p-4">
      <div className="relative">
        <h1 className="text-center font-bold text-lg">Page Transform</h1>
        <div className="absolute top-0 right-0 flex items-center gap-2">
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

      <AxisPercentInput
        label="Center X"
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
        label="Center Y"
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
        scale={transform.scale}
        onChange={(newValue) => applyTransform({ scale: newValue })}
        onAddKeyframe={() => addKeyframe("scale", transform.scale)}
        onRemoveKeyframe={() => removeKeyframe("scale")}
        hasKeyframe={hasKeyframeAtTime(
          animation.keyframes.scale,
          animation.currentTime,
        )}
      />

      <TranslateInput
        label="Translate X"
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
        label="Translate Y"
        value={transform.translateY}
        onChange={(newValue) => applyTransform({ translateY: newValue })}
        onAddKeyframe={() => addKeyframe("translateY", transform.translateY)}
        onRemoveKeyframe={() => removeKeyframe("translateY")}
        hasKeyframe={hasKeyframeAtTime(
          animation.keyframes.translateY,
          animation.currentTime,
        )}
      />

      <div className="flex space-x-4">
        <FlipCheckbox
          label="Horizontal Flip"
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
          label="Vertical Flip"
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
      </div>

      <DurationInput
        duration={animation.duration}
        onDurationChange={(duration) => updateAnimation({ duration })}
      />

      <Timeline animation={animation} onUpdateAnimation={updateAnimation} />
    </div>
  );
}
