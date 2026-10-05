import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
export function TopLayerPortal({ children }: { children: ReactNode }) {
  const [container, setContainer] = useState<ShadowRoot | null>(null);

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
    setContainer(shadowRoot);
    return () => {
      host.remove();
      setContainer(null);
    };
  }, []);

  if (container === null) {
    return null;
  }
  return createPortal(children, container);
}
