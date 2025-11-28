import { useId } from "react";
import { keyframeFieldLabels } from "@/src/feature/animation-state";
import { cn } from "@/src/lib/tailwind";
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
        "flex h-6 w-6 select-none items-center justify-center rounded px-2 py-1 font-bold text-lg text-white",
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
  setAnimationState,
  className,
}: {
  duration: number;
  setAnimationState: (update: { duration: number }) => void;
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
        onChange={(e) =>
          setAnimationState({ duration: Number(e.target.value) })
        }
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
  value,
  onChange,
  onAddKeyframe,
  onRemoveKeyframe,
  hasKeyframe,
  className,
}: {
  value: number;
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
          {label}: {Math.round(value * 10) / 10}°
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

function ScaleInput({
  value,
  onChange,
  onAddKeyframe,
  onRemoveKeyframe,
  hasKeyframe,
  className,
}: {
  value: number;
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
          {label}: {Math.round(value * 100) / 100}x
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
  value,
  onChange,
  onAddKeyframe,
  onRemoveKeyframe,
  hasKeyframe,
}: {
  fieldName: "flipVertical" | "flipHorizontal";
  value: boolean;
  onChange: (value: boolean) => void;
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
          checked={value}
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

function ResetButton({ reset }: { reset: () => void }) {
  return (
    <button
      type="button"
      onClick={reset}
      className="rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-700"
    >
      Reset
    </button>
  );
}

function PopupLink() {
  return (
    <a
      href={`chrome-extension://${browser.runtime.id}/popup.html`}
      target="_blank"
      className="rounded border px-4 py-2"
    >
      Dev
    </a>
  );
}

export function App() {
  const { animationState, setAnimationState, getKeyframeProps, reset } =
    useTransform();

  return (
    <div className="w-128 border border-gray-200 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="flex-1 text-center font-bold text-xl">Page Transform</h1>

        <div className="flex items-center gap-2">
          <ResetButton reset={reset} />
          <PopupLink />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <TranslateInput {...getKeyframeProps("translateX")} />
        <TranslateInput {...getKeyframeProps("translateY")} />
        <AxisPercentInput {...getKeyframeProps("centerX")} />
        <AxisPercentInput {...getKeyframeProps("centerY")} />
        <RotationInput {...getKeyframeProps("rotation")} />
        <ScaleInput {...getKeyframeProps("scale")} />
        <FlipCheckbox {...getKeyframeProps("flipHorizontal")} />
        <FlipCheckbox {...getKeyframeProps("flipVertical")} />

        <div className="col-span-2 space-y-2 bg-gray-100 px-1 py-2">
          <Timeline
            animationState={animationState}
            setAnimationState={setAnimationState}
          />

          <DurationInput
            duration={animationState.duration}
            setAnimationState={setAnimationState}
          />
        </div>
      </div>
    </div>
  );
}
