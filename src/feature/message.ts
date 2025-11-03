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

// Validation helper
export function validateMessage(data: unknown): Message {
  return v.parse(MessageSchema, data);
}

// Message handlers
import { browser } from "wxt/browser";
import { storage } from "wxt/utils/storage";

// Storage for animation states per tab URL
const animationStates = storage.defineItem<Record<string, AnimationState>>(
  "local:animationStates",
  {
    defaultValue: {},
  },
);

type MessageResponse =
  | { type: "message"; message: string }
  | { type: "response"; response: unknown };

export async function handleMessage(
  rawMessage: unknown,
): Promise<MessageResponse> {
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
        type: "message",
        message: `TODO`,
      };
    default:
      return {
        type: "message",
        message: `Unknown message type: ${typ satisfies never}`,
      };
  }
}

async function handleStartAnimationMessage(
  message: StartAnimationMessage,
): Promise<MessageResponse> {
  const { tabId, url } = await getCurrentTabInfo();
  if (!tabId || !url)
    return { type: "message", message: "No active tab found" };

  await saveAnimationState(url, message.animationState);

  await sendMessageToTab(tabId, message);

  return { type: "message", message: "Animation started" };
}

async function handleStopAnimationMessage(
  message: StopAnimationMessage,
): Promise<MessageResponse> {
  const { tabId, url } = await getCurrentTabInfo();
  if (!tabId || !url)
    return { type: "message", message: "No active tab found" };

  const currentState = await getAnimationState(url);
  if (currentState) {
    const updatedState = { ...currentState, isPlaying: false };
    await saveAnimationState(url, updatedState);

    await sendMessageToTab(tabId, message);
  }

  return { type: "message", message: "Animation stopped" };
}

async function handleUpdateAnimationStateMessage(
  message: UpdateAnimationStateMessage,
): Promise<MessageResponse> {
  const { tabId, url } = await getCurrentTabInfo();
  if (!tabId || !url)
    return { type: "message", message: "No active tab found" };

  await saveAnimationState(url, message.animationState);

  await sendMessageToTab(tabId, message);

  return { type: "message", message: "Animation state updated" };
}

async function handleGetAnimationStateMessage(
  _message: GetAnimationStateMessage,
): Promise<MessageResponse> {
  const { url } = await getCurrentTabInfo();
  const state = await getAnimationState(url);

  return {
    type: "response",
    response: createAnimationStateResponseMessage(state),
  };
}

async function handleAnimationProgressMessage(
  message: AnimationProgressMessage,
): Promise<MessageResponse> {
  const { tabId, url } = await getCurrentTabInfo();
  if (!tabId || !url)
    return { type: "message", message: "No active tab found" };

  const currentState = await getAnimationState(url);
  if (currentState) {
    const updatedState = {
      ...currentState,
      currentTime: message.currentTime,
      isPlaying: message.isPlaying,
    };
    await saveAnimationState(url, updatedState);
  }

  return { type: "message", message: "Animation progress updated" };
}

async function handleResetAnimationMessage(
  message: ResetAnimationMessage,
): Promise<MessageResponse> {
  const { tabId, url } = await getCurrentTabInfo();
  if (!tabId || !url)
    return { type: "message", message: "No active tab found" };

  const stored = await animationStates.getValue();
  const updatedStored = { ...stored };
  delete updatedStored[url];
  await animationStates.setValue(updatedStored);

  await sendMessageToTab(tabId, message);

  return { type: "message", message: "Animation reset" };
}

async function getCurrentTabInfo(): Promise<{ tabId?: number; url?: string }> {
  const [activeTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  return { tabId: activeTab?.id, url: activeTab?.url };
}

async function getAnimationState(
  url?: string,
): Promise<AnimationState | undefined> {
  if (!url) return undefined;

  const stored = await animationStates.getValue();
  return stored[url];
}

async function saveAnimationState(
  url: string,
  state: AnimationState,
): Promise<void> {
  const stored = await animationStates.getValue();
  await animationStates.setValue({
    ...stored,
    [url]: state,
  });
}

async function sendMessageToTab(
  tabId: number,
  message: Message,
): Promise<void> {
  await browser.tabs.sendMessage(tabId, message);
}

export async function restoreAnimationForTab(tabId: number): Promise<void> {
  const tab = await browser.tabs.get(tabId);
  if (!tab.url) return;

  const savedState = await getAnimationState(tab.url);
  if (savedState) {
    await sendMessageToTab(tabId, {
      type: "UPDATE_ANIMATION_STATE",
      timestamp: Date.now(),
      animationState: savedState,
    });
  }
}

export async function sendGetAnimationStateMessage(): Promise<AnimationStateResponseMessage> {
  const message: GetAnimationStateMessage = {
    type: "GET_ANIMATION_STATE",
    timestamp: Date.now(),
  };
  const response = await browser.runtime.sendMessage(message);
  return v.parse(AnimationStateResponseMessageSchema, response);
}

export async function sendStartAnimationMessage(
  animationState: AnimationState,
): Promise<void> {
  const message: StartAnimationMessage = {
    type: "START_ANIMATION",
    timestamp: Date.now(),
    animationState,
  };
  await browser.runtime.sendMessage(message);
}

export async function sendUpdateAnimationStateMessage(
  animationState: AnimationState,
): Promise<void> {
  const message: UpdateAnimationStateMessage = {
    type: "UPDATE_ANIMATION_STATE",
    timestamp: Date.now(),
    animationState,
  };
  await browser.runtime.sendMessage(message);
}

export async function sendResetAnimationMessage(): Promise<void> {
  const message: ResetAnimationMessage = {
    type: "RESET_ANIMATION",
    timestamp: Date.now(),
  };
  await browser.runtime.sendMessage(message);
}
