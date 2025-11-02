import { useEffect, useId, useRef } from "react";
import { browser } from "wxt/browser";
import {
  type AnimationStateResponseMessage,
  createGetAnimationStateMessage,
  validateMessage,
} from "@/src/feature/message";
import { strictEntries } from "@/src/lib/collection";
import { cn } from "@/src/lib/tailwind";
import {
  type AnimationKeyframes,
  type AnimationState,
  findNextKeyframeTime,
  findPreviousKeyframeTime,
  type KeyframeFieldName,
  keyframeFieldLabels,
  type RelativeTime,
} from "./keyframe";

function useAnimation({
  isPlaying,
  onUpdateAnimation,
}: {
  isPlaying: boolean;
  duration: number;
  currentTime: RelativeTime;
  onUpdateAnimation: (updates: { currentTime: number }) => void;
}) {
  const intervalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (isPlaying) {
      // Poll background script for current animation state
      const pollProgress = async () => {
        const response = await browser.runtime.sendMessage(
          createGetAnimationStateMessage(),
        );
        const validatedResponse = validateMessage(
          response,
        ) as AnimationStateResponseMessage;
        if (validatedResponse.animationState) {
          onUpdateAnimation({
            currentTime: validatedResponse.animationState.currentTime,
          });
        }
      };

      // Poll every 100ms when playing
      intervalRef.current = window.setInterval(pollProgress, 100);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, onUpdateAnimation]);
}

function PlayStopButton({
  isPlaying,
  onTogglePlay,
}: {
  isPlaying: boolean;
  onTogglePlay: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onTogglePlay}
      className="flex h-full w-6 items-center justify-center rounded bg-blue-500 px-3 py-1 text-white text-xs hover:bg-blue-600"
    >
      {isPlaying ? "■" : "▶"}
    </button>
  );
}

function KeyframeNextPrevButton({
  direction,
  keyframes,
  currentTime,
  onClick,
}: {
  direction: "prev" | "next";
  keyframes: AnimationKeyframes;
  currentTime: number;
  onClick: (currentTime: number) => void;
}) {
  const navigateToKeyframe = () => {
    switch (direction) {
      case "prev": {
        const prevTime = findPreviousKeyframeTime({ keyframes, currentTime });
        if (prevTime !== undefined) {
          onClick(prevTime);
        }
        return;
      }
      case "next": {
        const nextTime = findNextKeyframeTime({ keyframes, currentTime });
        if (nextTime !== undefined) {
          onClick(nextTime);
        }
        return;
      }
      default:
        throw new Error(`unexpected direction: ${direction satisfies never}`);
    }
  };

  return (
    <button
      type="button"
      onClick={navigateToKeyframe}
      className="flex h-full w-6 items-center justify-center rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
      title={direction === "prev" ? "Previous keyframe" : "Next keyframe"}
    >
      {direction === "prev" ? "←" : "→"}
    </button>
  );
}

function TimeIndicator({
  currentTime,
  duration,
  onTimeChange,
}: {
  currentTime: RelativeTime;
  duration: number;
  onTimeChange: (time: RelativeTime) => void;
}) {
  const currentTimePercent = currentTime * 100;
  const timelineId = useId();

  return (
    <div className="relative col-span-1 h-6 rounded bg-gray-100">
      <div
        className="absolute top-0 z-10 h-full w-0.5 bg-red-500"
        style={{ left: `${currentTimePercent}%` }}
      />
      <div className="absolute inset-0 flex items-center px-2">
        <label htmlFor={timelineId} className="sr-only">
          Timeline: {Math.round(currentTime * duration)}ms
        </label>
        <input
          id={timelineId}
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={currentTime}
          onChange={(e) => onTimeChange(Number(e.target.value))}
          className="w-full opacity-50"
          aria-label="Timeline"
        />
      </div>
    </div>
  );
}

function KeyframeLine({
  fieldName,
  keyframes,
  currentTime,
}: {
  fieldName: KeyframeFieldName;
  keyframes: Array<{ time: RelativeTime; value: number }>;
  currentTime: RelativeTime;
}) {
  return (
    <>
      <span key={`${fieldName}-label`} className="text-xs">
        {keyframeFieldLabels[fieldName]}
      </span>
      <div
        key={`${fieldName}-timeline`}
        className="relative h-full border border-gray-400"
      >
        {keyframes.map((kf, i) => (
          <div
            key={`${fieldName}-${kf.time}-${i}`}
            className={cn(
              "-translate-x-1/2 absolute h-full w-1.5 transform rounded-full",
              kf.time === currentTime
                ? "border border-blue-500 bg-blue-300"
                : "bg-gray-400",
            )}
            style={{
              left: `${kf.time * 100}%`,
            }}
          />
        ))}
      </div>
    </>
  );
}

export function Timeline({
  animation,
  onUpdateAnimation,
  className,
}: {
  animation: AnimationState;
  onUpdateAnimation: (updates: Partial<AnimationState>) => void;
  className?: string;
}) {
  useAnimation({
    isPlaying: animation.isPlaying,
    duration: animation.duration,
    currentTime: animation.currentTime,
    onUpdateAnimation: ({ currentTime }) => onUpdateAnimation({ currentTime }),
  });

  return (
    <div className={cn("grid grid-cols-[auto_1fr] gap-x-2 gap-y-2", className)}>
      <div className="flex gap-2">
        <KeyframeNextPrevButton
          direction="prev"
          keyframes={animation.keyframes}
          currentTime={animation.currentTime}
          onClick={(currentTime) =>
            onUpdateAnimation({ currentTime, isPlaying: false })
          }
        />
        <PlayStopButton
          isPlaying={animation.isPlaying}
          onTogglePlay={() =>
            onUpdateAnimation({ isPlaying: !animation.isPlaying })
          }
        />
        <KeyframeNextPrevButton
          direction="next"
          keyframes={animation.keyframes}
          currentTime={animation.currentTime}
          onClick={(currentTime) =>
            onUpdateAnimation({ currentTime, isPlaying: false })
          }
        />
      </div>

      <TimeIndicator
        currentTime={animation.currentTime}
        duration={animation.duration}
        onTimeChange={(currentTime) =>
          onUpdateAnimation({ currentTime, isPlaying: false })
        }
      />
      <div className="col-span-2 grid grid-cols-[auto_1fr] gap-1">
        {strictEntries(animation.keyframes).map(([fieldName, keyframes]) => (
          <KeyframeLine
            key={fieldName}
            fieldName={fieldName}
            keyframes={keyframes}
            currentTime={animation.currentTime}
          />
        ))}
      </div>
    </div>
  );
}
