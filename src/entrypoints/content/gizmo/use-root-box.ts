import { useEffect, useState } from "react";
import type { Box } from "@/src/feature/gizmo-geometry";

function readRootBox(): Box {
  const root = document.documentElement;
  return {
    left: -window.scrollX,
    top: -window.scrollY,
    width: root.offsetWidth,
    height: root.offsetHeight,
  };
}

export function useRootBox(): Box {
  const [box, setBox] = useState(readRootBox);

  useEffect(() => {
    const update = () => setBox(readRootBox());
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
