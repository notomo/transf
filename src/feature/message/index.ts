import * as v from "valibot";
import { getCurrentTabInfo } from "@/src/feature/animation-state";
import {
  GetAnimationStateMessageSchema,
  handleGetAnimationStateMessage,
} from "@/src/feature/message/get-animation-state";
import {
  handleUpdateAnimationStateMessage,
  UpdateAnimationStateMessageSchema,
} from "@/src/feature/message/update-animation-state";
import { UpdateContentAnimationStateMessageSchema } from "@/src/feature/message/update-content-animation-state";

const MessageInBackgroundSchema = v.union([
  UpdateAnimationStateMessageSchema,
  GetAnimationStateMessageSchema,
]);

export function validateMessageInContent(data: unknown) {
  return v.parse(UpdateContentAnimationStateMessageSchema, data);
}

export async function handleMessageInBackground(rawMessage: unknown) {
  const message = v.parse(MessageInBackgroundSchema, rawMessage);

  const tab = await getCurrentTabInfo();
  if (tab === null) {
    return { type: "message" as const, message: "no active tab found" };
  }

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

    default:
      throw new Error(
        `unexpected background message type: ${typ satisfies never}`,
      );
  }
}
