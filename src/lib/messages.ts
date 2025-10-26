import * as v from "valibot";
import type { AnimationState } from "@/src/entrypoints/popup/keyframe";

// Base message schema
const BaseMessageSchema = v.object({
  type: v.string(),
  timestamp: v.number(),
});

// Keyframe schema
const KeyframeSchema = v.object({
  time: v.number(),
  value: v.number(),
});

// Animation keyframes schema
const AnimationKeyframesSchema = v.object({
  rotation: v.array(KeyframeSchema),
  scale: v.array(KeyframeSchema),
  translateX: v.array(KeyframeSchema),
  translateY: v.array(KeyframeSchema),
  centerX: v.array(KeyframeSchema),
  centerY: v.array(KeyframeSchema),
  flipHorizontal: v.array(KeyframeSchema),
  flipVertical: v.array(KeyframeSchema),
});

// Transform state schema
const TransformStateSchema = v.object({
  centerX: v.number(),
  centerY: v.number(),
  rotation: v.number(),
  scale: v.number(),
  translateX: v.number(),
  translateY: v.number(),
  flipHorizontal: v.boolean(),
  flipVertical: v.boolean(),
});

// Animation state schema
const AnimationStateSchema = v.object({
  keyframes: AnimationKeyframesSchema,
  duration: v.number(),
  isPlaying: v.boolean(),
  currentTime: v.number(),
  baseTransform: TransformStateSchema,
});

// Animation control messages
export const StartAnimationMessageSchema = v.object({
  ...BaseMessageSchema.entries,
  type: v.literal("START_ANIMATION"),
  animationState: AnimationStateSchema,
});

export const StopAnimationMessageSchema = v.object({
  ...BaseMessageSchema.entries,
  type: v.literal("STOP_ANIMATION"),
});

export const UpdateAnimationStateMessageSchema = v.object({
  ...BaseMessageSchema.entries,
  type: v.literal("UPDATE_ANIMATION_STATE"),
  animationState: AnimationStateSchema,
});

export const GetAnimationStateMessageSchema = v.object({
  ...BaseMessageSchema.entries,
  type: v.literal("GET_ANIMATION_STATE"),
});

export const AnimationStateResponseMessageSchema = v.object({
  ...BaseMessageSchema.entries,
  type: v.literal("ANIMATION_STATE_RESPONSE"),
  animationState: v.optional(AnimationStateSchema),
});

export const AnimationProgressMessageSchema = v.object({
  ...BaseMessageSchema.entries,
  type: v.literal("ANIMATION_PROGRESS"),
  currentTime: v.number(),
  isPlaying: v.boolean(),
});

export const ResetAnimationMessageSchema = v.object({
  ...BaseMessageSchema.entries,
  type: v.literal("RESET_ANIMATION"),
});

// Union of all message types
export const MessageSchema = v.union([
  StartAnimationMessageSchema,
  StopAnimationMessageSchema,
  UpdateAnimationStateMessageSchema,
  GetAnimationStateMessageSchema,
  AnimationStateResponseMessageSchema,
  AnimationProgressMessageSchema,
  ResetAnimationMessageSchema,
]);

// Type exports
export type StartAnimationMessage = v.InferOutput<
  typeof StartAnimationMessageSchema
>;
export type StopAnimationMessage = v.InferOutput<
  typeof StopAnimationMessageSchema
>;
export type UpdateAnimationStateMessage = v.InferOutput<
  typeof UpdateAnimationStateMessageSchema
>;
export type GetAnimationStateMessage = v.InferOutput<
  typeof GetAnimationStateMessageSchema
>;
export type AnimationStateResponseMessage = v.InferOutput<
  typeof AnimationStateResponseMessageSchema
>;
export type AnimationProgressMessage = v.InferOutput<
  typeof AnimationProgressMessageSchema
>;
export type ResetAnimationMessage = v.InferOutput<
  typeof ResetAnimationMessageSchema
>;
export type Message = v.InferOutput<typeof MessageSchema>;

// Message creator functions
export function createStartAnimationMessage(
  animationState: AnimationState,
): StartAnimationMessage {
  return {
    type: "START_ANIMATION",
    timestamp: Date.now(),
    animationState,
  };
}

export function createStopAnimationMessage(): StopAnimationMessage {
  return {
    type: "STOP_ANIMATION",
    timestamp: Date.now(),
  };
}

export function createUpdateAnimationStateMessage(
  animationState: AnimationState,
): UpdateAnimationStateMessage {
  return {
    type: "UPDATE_ANIMATION_STATE",
    timestamp: Date.now(),
    animationState,
  };
}

export function createGetAnimationStateMessage(): GetAnimationStateMessage {
  return {
    type: "GET_ANIMATION_STATE",
    timestamp: Date.now(),
  };
}

export function createAnimationStateResponseMessage(
  animationState?: AnimationState,
): AnimationStateResponseMessage {
  return {
    type: "ANIMATION_STATE_RESPONSE",
    timestamp: Date.now(),
    animationState,
  };
}

export function createAnimationProgressMessage(
  currentTime: number,
  isPlaying: boolean,
): AnimationProgressMessage {
  return {
    type: "ANIMATION_PROGRESS",
    timestamp: Date.now(),
    currentTime,
    isPlaying,
  };
}

export function createResetAnimationMessage(): ResetAnimationMessage {
  return {
    type: "RESET_ANIMATION",
    timestamp: Date.now(),
  };
}

// Validation helper
export function validateMessage(data: unknown): Message {
  return v.parse(MessageSchema, data);
}
