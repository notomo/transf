import { useEffect, useRef } from "react";
import { generateAnimationStyles } from "@/src/feature/animation-css";
import type { AnimationState } from "@/src/feature/animation-state";

export function useStyleInjection(animationState: AnimationState | null) {
  const ref = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "transf-animation-styles";
    document.head.appendChild(style);
    ref.current = style;

    return () => {
      if (!ref.current) {
        return;
      }
      ref.current.remove();
      ref.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    ref.current.textContent = generateAnimationStyles(animationState);
  }, [animationState]);

  const clearStyles = () => {
    if (!ref.current) {
      return;
    }
    ref.current.textContent = "";
  };

  return { clearStyles };
}
