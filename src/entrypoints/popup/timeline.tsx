import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import type {
  AnimationKeyframes,
  AnimationState,
  InterpolationType,
  KeyframeFieldName,
  RelativeTime,
} from "@/src/feature/animation-state";
import {
  interpolationTypes,
  keyframeFieldLabels,
} from "@/src/feature/animation-state";
import { calculateTimeFromPosition } from "@/src/feature/animation-time";
import {
  addKeyframeTo,
  findNextKeyframeTime,
  findPreviousKeyframeTime,
  interpolateKeyframes,
  moveKeyframe,
  updateInterpolationTypeForAllFieldsAtTime,
} from "@/src/feature/keyframe";
import { sendGetAnimationStateMessage } from "@/src/feature/message/get-animation-state";
import { strictEntries } from "@/src/lib/collection";
import { cn } from "@/src/lib/tailwind";

function useCurrentTimePolling({
  isPlaying,
  setAnimationState,
}: {
  isPlaying: boolean;
  duration: number;
  currentTime: RelativeTime;
  setAnimationState: (updates: { currentTime: number }) => void;
}) {
  const getCurrentTime = useEffectEvent(async () => {
    const response = await sendGetAnimationStateMessage();
    if (response.animationState) {
      setAnimationState({
        currentTime: response.animationState.currentTime,
      });
    }
  });

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const intervalId = window.setInterval(getCurrentTime, 100);
    return () => {
      clearInterval(intervalId);
    };
  }, [isPlaying]);
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

function InterpolationTypeSelector({
  keyframes,
  currentTime,
  onInterpolationTypeChange,
}: {
  keyframes: AnimationKeyframes;
  currentTime: RelativeTime;
  onInterpolationTypeChange: ({
    time,
    interpolationType,
  }: {
    time: RelativeTime;
    interpolationType: InterpolationType;
  }) => void;
}) {
  const hasKeyframeAtCurrentTime = Object.values(keyframes).some(
    (fieldKeyframes) => fieldKeyframes.some((kf) => kf.time === currentTime),
  );

  const currentInterpolationType = (() => {
    for (const fieldKeyframes of Object.values(keyframes)) {
      const keyframe = fieldKeyframes.find((kf) => kf.time === currentTime);
      if (keyframe) {
        return keyframe.interpolationType;
      }
    }
    return "linear";
  })();

  return (
    <div className="col-span-1 flex items-center gap-2">
      <label
        htmlFor="interpolation-type"
        className={cn("text-xs", !hasKeyframeAtCurrentTime && "text-gray-400")}
      >
        Easing:
      </label>
      <select
        id="interpolation-type"
        value={currentInterpolationType}
        onChange={(e) =>
          onInterpolationTypeChange({
            time: currentTime,
            interpolationType: e.target.value as InterpolationType,
          })
        }
        disabled={!hasKeyframeAtCurrentTime}
        className="rounded border border-gray-300 bg-white px-2 py-1 text-xs disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
        title={
          hasKeyframeAtCurrentTime
            ? "Animation easing for all fields at this keyframe time"
            : "No keyframes at current time"
        }
      >
        {interpolationTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
    </div>
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
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();

    const newTime =
      calculateTimeFromPosition({
        clientX: e.clientX,
        rect: ref.current?.getBoundingClientRect(),
      }) ?? currentTime;
    onTimeChange(newTime);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const updatedTime =
        calculateTimeFromPosition({
          clientX: moveEvent.clientX,
          rect: ref.current?.getBoundingClientRect(),
        }) ?? currentTime;
      onTimeChange(updatedTime);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={ref}
      className="relative col-span-1 h-6 cursor-pointer rounded bg-gray-100"
      onMouseDown={handleMouseDown}
      role="slider"
      aria-label={`Timeline: ${Math.round(currentTime * duration)}ms`}
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={currentTime}
      tabIndex={0}
    >
      <div
        className="-translate-x-1/2 absolute top-0 h-full w-3 rounded bg-blue-500 hover:bg-blue-600"
        style={{ left: `${currentTime * 100}%` }}
      />
    </div>
  );
}

function KeyframeLine({
  fieldName,
  keyframes,
  currentTime,
  onKeyframeClick,
  onKeyframeTimeChange,
  onAddKeyframe,
}: {
  fieldName: KeyframeFieldName;
  keyframes: Array<{
    time: RelativeTime;
    value: number;
    interpolationType: InterpolationType;
  }>;
  currentTime: RelativeTime;
  onKeyframeClick: (time: RelativeTime) => void;
  onKeyframeTimeChange: ({
    fieldName,
    fromTime,
    toTime,
  }: {
    fieldName: KeyframeFieldName;
    fromTime: RelativeTime;
    toTime: RelativeTime;
  }) => void;
  onAddKeyframe: ({
    fieldName,
    time,
  }: {
    fieldName: KeyframeFieldName;
    time: RelativeTime;
  }) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [draggingKeyframeTime, setDraggingKeyframeTime] = useState<
    number | null
  >(null);

  const handleKeyframeMouseDown = (
    e: React.MouseEvent,
    keyframeTime: RelativeTime,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setDraggingKeyframeTime(keyframeTime);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newTime =
        calculateTimeFromPosition({
          clientX: moveEvent.clientX,
          rect: ref.current?.getBoundingClientRect(),
        }) ?? 0;
      onKeyframeTimeChange({
        fieldName,
        fromTime: keyframeTime,
        toTime: newTime,
      });
    };

    const handleMouseUp = () => {
      setDraggingKeyframeTime(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const time =
      calculateTimeFromPosition({
        clientX: e.clientX,
        rect: ref.current?.getBoundingClientRect(),
      }) ?? 0;
    onAddKeyframe({ fieldName, time });
  };

  return (
    <>
      <span key={`${fieldName}-label`} className="text-xs">
        {keyframeFieldLabels[fieldName]}
      </span>
      <section
        ref={ref}
        key={`${fieldName}-timeline`}
        className="relative h-full border border-gray-400"
        onDoubleClick={handleDoubleClick}
        aria-label={`Keyframe timeline: ${keyframeFieldLabels[fieldName]} (double-click to add)`}
      >
        {keyframes.map((kf, i) => (
          <div
            key={`${fieldName}-${kf.time}-${i}`}
            className="-translate-x-1/2 absolute h-full"
            style={{
              left: `${kf.time * 100}%`,
              zIndex: kf.time === currentTime ? 50 : "auto",
            }}
          >
            <button
              type="button"
              className={cn(
                "h-full w-2 transform cursor-pointer rounded-full transition-transform",
                kf.time === currentTime
                  ? "border border-blue-500 bg-blue-300"
                  : "bg-gray-400",
                draggingKeyframeTime === kf.time &&
                  "cursor-grabbing opacity-70",
              )}
              onClick={(_e) => {
                // Only handle click if not dragging
                if (draggingKeyframeTime === null) {
                  onKeyframeClick(kf.time);
                }
              }}
              onMouseDown={(e) => handleKeyframeMouseDown(e, kf.time)}
              aria-label={`Jump to keyframe at ${Math.round(kf.time * 100)}%`}
            />
          </div>
        ))}
      </section>
    </>
  );
}

export function Timeline({
  animationState,
  setAnimationState,
  className,
}: {
  animationState: AnimationState;
  setAnimationState: (updates: Partial<AnimationState>) => void;
  className?: string;
}) {
  useCurrentTimePolling({
    isPlaying: animationState.isPlaying,
    duration: animationState.duration,
    currentTime: animationState.currentTime,
    setAnimationState,
  });

  const handleKeyframeTimeChange = useCallback(
    ({
      fieldName,
      fromTime,
      toTime,
    }: {
      fieldName: KeyframeFieldName;
      fromTime: RelativeTime;
      toTime: RelativeTime;
    }) => {
      const fieldKeyframes = animationState.keyframes[fieldName];
      const updatedKeyframes = moveKeyframe({
        keyframes: fieldKeyframes,
        fromTime,
        toTime,
      });

      setAnimationState({
        keyframes: {
          ...animationState.keyframes,
          [fieldName]: updatedKeyframes,
        },
        isPlaying: false,
        currentTime: toTime,
      });
    },
    [animationState.keyframes, setAnimationState],
  );

  const handleAddKeyframe = useCallback(
    ({
      fieldName,
      time,
    }: {
      fieldName: KeyframeFieldName;
      time: RelativeTime;
    }) => {
      const fieldKeyframes = animationState.keyframes[fieldName];

      const value = interpolateKeyframes({
        keyframes: fieldKeyframes,
        time,
        defaultValue: animationState.baseTransform[fieldName],
      });

      const updatedKeyframes = addKeyframeTo({
        keyframes: fieldKeyframes,
        time,
        value,
      });

      setAnimationState({
        keyframes: {
          ...animationState.keyframes,
          [fieldName]: updatedKeyframes,
        },
        isPlaying: false,
        currentTime: time,
      });
    },
    [animationState.keyframes, animationState.baseTransform, setAnimationState],
  );

  const handleInterpolationTypeChange = useCallback(
    ({
      time,
      interpolationType,
    }: {
      time: RelativeTime;
      interpolationType: InterpolationType;
    }) => {
      const updatedKeyframes = updateInterpolationTypeForAllFieldsAtTime({
        keyframes: animationState.keyframes,
        time,
        interpolationType,
      });

      setAnimationState({
        keyframes: updatedKeyframes,
      });
    },
    [animationState.keyframes, setAnimationState],
  );

  const setCurrentTimeAndPause = useCallback(
    (currentTime: RelativeTime) => {
      setAnimationState({ currentTime, isPlaying: false });
    },
    [setAnimationState],
  );

  const togglePlay = useCallback(() => {
    setAnimationState({ isPlaying: !animationState.isPlaying });
  }, [animationState.isPlaying, setAnimationState]);

  return (
    // 88px = 3 buttons (24px each with w-6) + 2 gaps (8px each with gap-2)
    // This fixed width ensures TimeIndicator and KeyframeLine containers have the same width
    <div className={cn("grid grid-cols-[88px_1fr] gap-x-1 gap-y-2", className)}>
      <div className="flex gap-2">
        <KeyframeNextPrevButton
          direction="prev"
          keyframes={animationState.keyframes}
          currentTime={animationState.currentTime}
          onClick={setCurrentTimeAndPause}
        />
        <PlayStopButton
          isPlaying={animationState.isPlaying}
          onTogglePlay={togglePlay}
        />
        <KeyframeNextPrevButton
          direction="next"
          keyframes={animationState.keyframes}
          currentTime={animationState.currentTime}
          onClick={setCurrentTimeAndPause}
        />
      </div>

      <TimeIndicator
        currentTime={animationState.currentTime}
        duration={animationState.duration}
        onTimeChange={setCurrentTimeAndPause}
      />

      <div className="col-span-2">
        <InterpolationTypeSelector
          keyframes={animationState.keyframes}
          currentTime={animationState.currentTime}
          onInterpolationTypeChange={handleInterpolationTypeChange}
        />
      </div>

      {/* Match the outer grid's first column width to align keyframe timelines with TimeIndicator */}
      <div className="col-span-2 grid grid-cols-[88px_1fr] gap-1">
        {strictEntries(animationState.keyframes).map(
          ([fieldName, keyframes]) => (
            <KeyframeLine
              key={fieldName}
              fieldName={fieldName}
              keyframes={keyframes}
              currentTime={animationState.currentTime}
              onKeyframeClick={setCurrentTimeAndPause}
              onKeyframeTimeChange={handleKeyframeTimeChange}
              onAddKeyframe={handleAddKeyframe}
            />
          ),
        )}
      </div>
    </div>
  );
}
