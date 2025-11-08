import * as v from "valibot";
import { getCurrentTabInfo } from "@/src/feature/animation-state";
import {
  AnimationProgressMessageSchema,
  handleAnimationProgressMessage,
} from "@/src/feature/message/animation-progress";
import {
  GetAnimationStateMessageSchema,
  handleGetAnimationStateMessage,
} from "@/src/feature/message/get-animation-state";
import {
  handleResetAnimationMessage,
  ResetAnimationMessageSchema,
} from "@/src/feature/message/reset-animation";
import {
  handleStartAnimationMessage,
  StartAnimationMessageSchema,
} from "@/src/feature/message/start-animation";
import {
  handleStopAnimationMessage,
  StopAnimationMessageSchema,
} from "@/src/feature/message/stop-animation";
import {
  handleUpdateAnimationStateMessage,
  UpdateAnimationStateMessageSchema,
} from "@/src/feature/message/update-animation-state";

const MessageInBackgroundSchema = v.union([
  StartAnimationMessageSchema,
  StopAnimationMessageSchema,
  UpdateAnimationStateMessageSchema,
  GetAnimationStateMessageSchema,
  AnimationProgressMessageSchema,
  ResetAnimationMessageSchema,
]);

const MessageInContentSchema = v.union([
  StartAnimationMessageSchema,
  StopAnimationMessageSchema,
  UpdateAnimationStateMessageSchema,
  ResetAnimationMessageSchema,
]);

type MessageInContent = v.InferOutput<typeof MessageInContentSchema>;

export function validateMessageInContent(data: unknown): MessageInContent {
  return v.parse(MessageInContentSchema, data);
}

export async function handleMessageInBackground(rawMessage: unknown) {
  const message = v.parse(MessageInBackgroundSchema, rawMessage);

  const tab = await getCurrentTabInfo();

  const typ = message.type;
  switch (typ) {
    case "START_ANIMATION":
      await handleStartAnimationMessage({ message, tab });
      return { type: "message" as const, message: `handled: ${typ}` };

    case "STOP_ANIMATION":
      await handleStopAnimationMessage({ message, tab });
      return { type: "message" as const, message: `handled: ${typ}` };

    case "UPDATE_ANIMATION_STATE":
      await handleUpdateAnimationStateMessage({ message, tab });
      return { type: "message" as const, message: `handled: ${typ}` };

    case "ANIMATION_PROGRESS":
      await handleAnimationProgressMessage({ message, tab });
      return { type: "message" as const, message: `handled: ${typ}` };

    case "RESET_ANIMATION":
      await handleResetAnimationMessage({ message, tab });
      return { type: "message" as const, message: `handled: ${typ}` };

    case "GET_ANIMATION_STATE":
      return {
        type: "response" as const,
        body: await handleGetAnimationStateMessage({ message, tab }),
      };

    default:
      throw new Error(
        `unexpected background message type: ${typ satisfies never}`,
      );
  }
}
