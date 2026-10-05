import { useEffect, useState } from "react";
import type { Box, Size } from "@/src/feature/gizmo-geometry";

export type RootLayout = { box: Box; viewport: Size };

// Viewport size excluding scrollbars.
// Uses scrollingElement because documentElement.clientHeight is the document height in quirks mode.
function readViewportSize(): Size {
  const element = document.scrollingElement ?? document.documentElement;
  return { width: element.clientWidth, height: element.clientHeight };
}

export function readRootLayout(): RootLayout {
  const root = document.documentElement;
  const viewport = readViewportSize();
  return {
    box: {
      left: -window.scrollX,
      top: -window.scrollY,
      width: root.offsetWidth,
      // The generated style makes the root element at least as tall as the viewport.
      // Apply it here too so that the box is the same before the style is applied.
      height: Math.max(root.offsetHeight, viewport.height),
    },
    viewport,
  };
}

export function useRootBox(): Box {
  const [box, setBox] = useState(() => readRootLayout().box);

  useEffect(() => {
    const update = () => setBox(readRootLayout().box);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer = new ResizeObserver(update);
    observer.observe(document.documentElement);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, []);

  return box;
}
