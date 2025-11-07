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
      return await handleStartAnimationMessage({ message, tab });
    case "STOP_ANIMATION":
      return await handleStopAnimationMessage({ message, tab });
    case "UPDATE_ANIMATION_STATE":
      return await handleUpdateAnimationStateMessage({ message, tab });
    case "GET_ANIMATION_STATE":
      return await handleGetAnimationStateMessage({ message, tab });
    case "ANIMATION_PROGRESS":
      return await handleAnimationProgressMessage({ message, tab });
    case "RESET_ANIMATION":
      return await handleResetAnimationMessage({ message, tab });
    default:
      return {
        type: "message" as const,
        message: `Unknown message type: ${typ satisfies never}`,
      };
  }
}
