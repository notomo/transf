import { useState } from "react";
import type { AnimationState } from "@/src/feature/animation-state";
import { HeadStyle } from "./head-style";
import { useCurrentTimeUpdater } from "./use-current-time-updater";
import { useMessageHandler } from "./use-message-handler";

export function App() {
  const [animationState, setAnimationState] = useState<AnimationState | null>(
    null,
  );

  useCurrentTimeUpdater({ animationState });

  useMessageHandler({ setAnimationState });

  return <HeadStyle animationState={animationState} />;
}
