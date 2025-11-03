import * as v from "valibot";
import {
  AnimationProgressMessageSchema,
  handleAnimationProgressMessage,
} from "@/src/feature/message/animation-progress";
import { AnimationStateResponseMessageSchema } from "@/src/feature/message/animation-state-response";
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

export type { AnimationProgressMessage } from "@/src/feature/message/animation-progress";
export type { AnimationStateResponseMessage } from "@/src/feature/message/animation-state-response";

export const MessageSchema = v.union([
  StartAnimationMessageSchema,
  StopAnimationMessageSchema,
  UpdateAnimationStateMessageSchema,
  GetAnimationStateMessageSchema,
  AnimationStateResponseMessageSchema,
  AnimationProgressMessageSchema,
  ResetAnimationMessageSchema,
]);

export type Message = v.InferOutput<typeof MessageSchema>;

export function validateMessage(data: unknown): Message {
  return v.parse(MessageSchema, data);
}

export async function handleMessage(rawMessage: unknown) {
  const message = validateMessage(rawMessage);

  const typ = message.type;
  switch (typ) {
    case "START_ANIMATION":
      return await handleStartAnimationMessage(message);
    case "STOP_ANIMATION":
      return await handleStopAnimationMessage(message);
    case "UPDATE_ANIMATION_STATE":
      return await handleUpdateAnimationStateMessage(message);
    case "GET_ANIMATION_STATE":
      return await handleGetAnimationStateMessage(message);
    case "ANIMATION_PROGRESS":
      return await handleAnimationProgressMessage(message);
    case "RESET_ANIMATION":
      return await handleResetAnimationMessage(message);
    case "ANIMATION_STATE_RESPONSE":
      return {
        type: "message" as const,
        message: `TODO`,
      };
    default:
      return {
        type: "message" as const,
        message: `Unknown message type: ${typ satisfies never}`,
      };
  }
}
