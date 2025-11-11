import { useEffect, useRef } from "react";
import { generateAnimationStyles } from "@/src/feature/animation-controller";
import type { AnimationState } from "@/src/feature/animation-state";

export function useStyleInjection(animationState: AnimationState | null) {
  const ref = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.id = "transf-animation-styles";
    document.head.appendChild(styleElement);
    ref.current = styleElement;

    return () => {
      if (ref.current) {
        ref.current.remove();
        ref.current = null;
      }

      document.documentElement.style.removeProperty("animation");
      document.documentElement.style.removeProperty("animation-delay");
      document.documentElement.style.removeProperty("transform");
      document.documentElement.style.removeProperty("transform-origin");
      document.documentElement.style.removeProperty("transition");
    };
  }, []);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    ref.current.textContent = generateAnimationStyles(animationState);
  }, [animationState]);

  const clearStyles = () => {
    if (ref.current) {
      ref.current.textContent = "";
    }
    document.documentElement.style.removeProperty("animation");
    document.documentElement.style.removeProperty("animation-delay");
    document.documentElement.style.removeProperty("transform");
    document.documentElement.style.removeProperty("transform-origin");
    document.documentElement.style.removeProperty("transition");
  };

  return { clearStyles };
}
