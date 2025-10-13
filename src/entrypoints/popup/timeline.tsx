import { useEffect, useId, useRef } from "react";
import { cn } from "@/src/lib/tailwind";
import type { useTransform } from "./transform";

export function Timeline({
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
      <div>
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
          <div className="relative col-span-1 h-6 rounded bg-gray-100">
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
                      className={cn(
                        "-translate-x-1 absolute h-3 w-3 transform rounded-full",
                        kf.time === animation.currentTime
                          ? "border border-blue-500 bg-blue-300"
                          : "bg-gray-400",
                      )}
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
