import type { Page, Worker } from "@playwright/test";
import type { Browser } from "wxt/browser";
import type { AnimationState } from "../../src/feature/animation-state";
import { expect } from "../fixtures";

// Available in the extension service worker where evaluate() runs.
declare const chrome: typeof Browser;

export async function openTestPage({
  page,
  url,
  mainHeight = "100vh",
  quirksMode = false,
}: {
  page: Page;
  url: string;
  mainHeight?: string;
  quirksMode?: boolean;
}) {
  await page.route(url, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `${quirksMode ? "" : "<!doctype html>"}
<html>
  <head><style>html, body { margin: 0; } main { height: ${mainHeight}; }</style></head>
  <body><main>content</main></body>
</html>`,
    }),
  );
  await page.goto(url);
}

export async function sendAnimationStateToContent({
  serviceWorker,
  url,
  animationState,
}: {
  serviceWorker: Worker;
  url: string;
  animationState: AnimationState;
}) {
  // Retry until the content script's message listener is registered.
  await expect(async () => {
    await serviceWorker.evaluate(
      async ({ url, animationState }) => {
        const [tab] = await chrome.tabs.query({ url });
        if (tab?.id === undefined) {
          throw new Error(`tab not found: ${url}`);
        }
        await chrome.tabs.sendMessage(tab.id, {
          type: "UPDATE_CONTENT",
          animationState,
        });
      },
      { url, animationState },
    );
  }).toPass();
}

export async function sendShowGizmoToContent({
  serviceWorker,
  url,
}: {
  serviceWorker: Worker;
  url: string;
}): Promise<unknown> {
  let response: unknown;
  // Retry until the content script's message listener is registered.
  await expect(async () => {
    response = await serviceWorker.evaluate(async (url) => {
      const [tab] = await chrome.tabs.query({ url });
      if (tab?.id === undefined) {
        throw new Error(`tab not found: ${url}`);
      }
      return await chrome.tabs.sendMessage(tab.id, { type: "SHOW_GIZMO" });
    }, url);
  }).toPass();
  return response;
}

export async function getStoredAnimationState({
  serviceWorker,
  url,
}: {
  serviceWorker: Worker;
  url: string;
}): Promise<AnimationState | undefined> {
  return await serviceWorker.evaluate(async (url) => {
    const { animationStates } =
      await chrome.storage.local.get("animationStates");
    return (animationStates as Record<string, AnimationState> | undefined)?.[
      url
    ];
  }, url);
}

export async function setGizmoEnabled({
  serviceWorker,
  enabled,
}: {
  serviceWorker: Worker;
  enabled: boolean;
}) {
  await serviceWorker.evaluate(async (enabled) => {
    await chrome.storage.local.set({ gizmoEnabled: enabled });
  }, enabled);
}
