import * as v from "valibot";
import { browser } from "wxt/browser";
import { AnimationStateSchema } from "@/src/feature/animation-state";

export const ShowGizmoMessageSchema = v.object({
  type: v.literal("SHOW_GIZMO"),
});

type ShowGizmoMessage = v.InferOutput<typeof ShowGizmoMessageSchema>;

export const ShowGizmoResponseSchema = v.object({
  // null if the tab has no content script (e.g. browser internal pages)
  initialAnimationState: v.nullable(AnimationStateSchema),
});

export type ShowGizmoResponse = v.InferOutput<typeof ShowGizmoResponseSchema>;

export async function handleShowGizmoMessage({
  tab,
}: {
  tab: { id: number };
}): Promise<ShowGizmoResponse> {
  const message: ShowGizmoMessage = { type: "SHOW_GIZMO" };
  try {
    const response = await browser.tabs.sendMessage(tab.id, message);
    return v.parse(ShowGizmoResponseSchema, response);
  } catch (error) {
    console.info(`failed to show gizmo: ${error}`);
    return { initialAnimationState: null };
  }
}

export async function sendShowGizmoMessage(): Promise<ShowGizmoResponse> {
  const message: ShowGizmoMessage = { type: "SHOW_GIZMO" };
  const response = await browser.runtime.sendMessage(message);
  return v.parse(ShowGizmoResponseSchema, response);
}
