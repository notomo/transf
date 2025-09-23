import { useId } from "react";
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

export function App() {
  const { transform, applyTransform, resetTransform } = useTransform();

  return (
    <div className="w-80 space-y-4 p-4">
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

      <div className="flex justify-center">
        <button
          type="button"
          onClick={resetTransform}
          className="rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
