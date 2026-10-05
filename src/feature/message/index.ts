import * as v from "valibot";
import {
  GetAnimationStateMessageSchema,
  handleGetAnimationStateMessage,
} from "@/src/feature/message/get-animation-state";
import {
  handleShowGizmoMessage,
  ShowGizmoMessageSchema,
} from "@/src/feature/message/show-gizmo";
import {
  handleUpdateAnimationStateMessage,
  UpdateAnimationStateMessageSchema,
  UpdateContentMessageSchema,
} from "@/src/feature/message/update-animation-state";

const MessageInBackgroundSchema = v.union([
  UpdateAnimationStateMessageSchema,
  GetAnimationStateMessageSchema,
  ShowGizmoMessageSchema,
]);

const MessageInContentSchema = v.variant("type", [
  UpdateContentMessageSchema,
  ShowGizmoMessageSchema,
]);

export function validateMessageInContent(data: unknown) {
  return v.parse(MessageInContentSchema, data);
}

export async function handleMessageInBackground(rawMessage: unknown) {
  const message = v.parse(MessageInBackgroundSchema, rawMessage);

  const [activeTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  if (!activeTab?.id || !activeTab?.url) {
    return { type: "message" as const, message: "no active tab found" };
  }
  const tab = { id: activeTab.id, url: activeTab.url };

  const typ = message.type;
  switch (typ) {
    case "UPDATE_ANIMATION_STATE":
      await handleUpdateAnimationStateMessage({ message, tab });
      return { type: "message" as const, message: `handled: ${typ}` };

    case "GET_ANIMATION_STATE":
      return {
        type: "response" as const,
        messageType: typ,
        body: await handleGetAnimationStateMessage({ tab }),
      };

    case "SHOW_GIZMO":
      return {
        type: "response" as const,
        messageType: typ,
        body: await handleShowGizmoMessage({ tab }),
      };

    default:
      throw new Error(
        `unexpected background message type: ${typ satisfies never}`,
      );
  }
}
