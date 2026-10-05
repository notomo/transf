import { useEffect, useEffectEvent } from "react";
import { browser } from "wxt/browser";
import type { AnimationState } from "@/src/feature/animation-state";
import { validateMessageInContent } from "@/src/feature/message";
import type { ShowGizmoResponse } from "@/src/feature/message/show-gizmo";

export function useMessageHandler({
  setAnimationState,
  showGizmo,
}: {
  setAnimationState: (state: AnimationState | null) => void;
  showGizmo: () => AnimationState;
}) {
  const handleMessage = useEffectEvent(
    async (rawMessage: unknown): Promise<unknown> => {
      const message = validateMessageInContent(rawMessage);
      const typ = message.type;
      switch (typ) {
        case "UPDATE_CONTENT":
          setAnimationState(message.animationState);
          return { success: true };
        case "SHOW_GIZMO":
          return {
            initialAnimationState: showGizmo(),
          } satisfies ShowGizmoResponse;
        default:
          throw new Error(
            `unexpected content message type: ${typ satisfies never}`,
          );
      }
    },
  );

  useEffect(() => {
    const handler = (
      rawMessage: unknown,
      _sender: unknown,
      sendResponse: (response?: unknown) => void,
    ) => {
      handleMessage(rawMessage).then(sendResponse);
      // Return true to indicate async response
      return true;
    };

    browser.runtime.onMessage.addListener(handler);

    return () => {
      browser.runtime.onMessage.removeListener(handler);
    };
  }, []);
}
