import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { AnimationController } from "./animation-controller";

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_end",
  cssInjectionMode: "ui",

  async main(ctx) {
    console.log("Content script loaded");

    const ui = await createShadowRootUi(ctx, {
      name: "transf-animation-controller",
      position: "inline",
      anchor: "body",
      onMount: (container) => {
        const wrapper = document.createElement("div");
        container.append(wrapper);

        const root = ReactDOM.createRoot(wrapper);
        root.render(
          <StrictMode>
            <AnimationController />
          </StrictMode>,
        );
        return { wrapper, root };
      },
      onRemove: (elements) => {
        elements?.root.unmount();
        elements?.wrapper.remove();
      },
    });

    ui.mount();
  },
});
