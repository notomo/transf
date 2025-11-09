import { useEffect, useRef } from "react";
import type { AnimationState } from "@/src/entrypoints/popup/keyframe";
import { generateAnimationStyles } from "@/src/feature/animation-controller";

export function useStyleInjection(animationState: AnimationState | null) {
  const styleElementRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    // Initialize style element
    const styleElement = document.createElement("style");
    styleElement.id = "transf-animation-styles";
    document.head.appendChild(styleElement);
    styleElementRef.current = styleElement;

    return () => {
      // Cleanup: remove style element and clear document styles
      if (styleElementRef.current) {
        styleElementRef.current.remove();
        styleElementRef.current = null;
      }

      // Clear any remaining styles from document
      document.documentElement.style.removeProperty("animation");
      document.documentElement.style.removeProperty("animation-delay");
      document.documentElement.style.removeProperty("transform");
      document.documentElement.style.removeProperty("transform-origin");
      document.documentElement.style.removeProperty("transition");
    };
  }, []);

  useEffect(() => {
    if (!styleElementRef.current) {
      return;
    }

    const { styles } = generateAnimationStyles(animationState);
    styleElementRef.current.textContent = styles;
  }, [animationState]);

  const clearStyles = () => {
    if (styleElementRef.current) {
      styleElementRef.current.textContent = "";
    }
    document.documentElement.style.removeProperty("animation");
    document.documentElement.style.removeProperty("animation-delay");
    document.documentElement.style.removeProperty("transform");
    document.documentElement.style.removeProperty("transform-origin");
    document.documentElement.style.removeProperty("transition");
  };

  return { clearStyles };
}
