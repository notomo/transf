import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app";

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_end",
  cssInjectionMode: "manual",

  main(ctx) {
    const container = document.createElement("div");
    const root = ReactDOM.createRoot(container);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    ctx.onInvalidated(() => {
      root.unmount();
    });
  },
});
