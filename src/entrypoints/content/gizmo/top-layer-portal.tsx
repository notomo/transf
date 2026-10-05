import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Size } from "@/src/feature/gizmo-geometry";

const HOST_STYLE = {
  position: "fixed",
  inset: "0",
  width: "100%",
  height: "100%",
  "max-width": "none",
  "max-height": "none",
  margin: "0",
  padding: "0",
  border: "none",
  background: "transparent",
  overflow: "visible",
  "pointer-events": "none",
};

// Renders children in the top layer so that the transform applied to <html> does not affect them.
// Children receive the viewport size excluding scrollbars, measured by the host covering the viewport.
export function TopLayerPortal({
  children,
}: {
  children: (viewport: Size) => ReactNode;
}) {
  const [container, setContainer] = useState<ShadowRoot | null>(null);
  const [viewport, setViewport] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    const host = document.createElement("div");
    host.id = "transf-gizmo";
    host.popover = "manual";
    for (const [name, value] of Object.entries(HOST_STYLE)) {
      host.style.setProperty(name, value, "important");
    }
    const shadowRoot = host.attachShadow({ mode: "open" });
    document.documentElement.append(host);
    host.showPopover();

    // Scrollbars can appear without scroll or resize events (e.g. by the page transform).
    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setViewport({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(host);

    setContainer(shadowRoot);
    return () => {
      observer.disconnect();
      host.remove();
      setContainer(null);
    };
  }, []);

  if (container === null) {
    return null;
  }
  return createPortal(children(viewport), container);
}
