import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app";

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_end",
  cssInjectionMode: "manual",

  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "transf-app",
      position: "inline",
      anchor: "body",
      onMount: (container) => {
        const root = ReactDOM.createRoot(container);
        root.render(
          <StrictMode>
            <App />
          </StrictMode>,
        );
        return { root };
      },
      onRemove: (elements) => {
        elements?.root.unmount();
      },
    });

    ui.mount();
  },
});
