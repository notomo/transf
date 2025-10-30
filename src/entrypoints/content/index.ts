import { browser } from "wxt/browser";
import {
  type AnimationControllerState,
  calculateCurrentTime,
  createAnimationControllerState,
  generateAnimationStyles,
  resetAnimation,
  startAnimation,
  stopAnimation,
  updateAnimationState,
  updateCurrentTime,
} from "@/src/feature/animation-controller";
import {
  createAnimationProgressMessage,
  createAnimationStateResponseMessage,
  type Message,
  type StartAnimationMessage,
  type UpdateAnimationStateMessage,
  validateMessage,
} from "@/src/feature/message";

let controllerState: AnimationControllerState =
  createAnimationControllerState();
let styleElement: HTMLStyleElement | null = null;
let progressInterval: number | null = null;

function initializeStyleElement(): void {
  styleElement = document.createElement("style");
  styleElement.id = "transf-animation-styles";
  document.head.appendChild(styleElement);
}

function setupMessageListener(): void {
  browser.runtime.onMessage.addListener(
    (message: unknown, _sender, sendResponse) => {
      try {
        const validatedMessage = validateMessage(message);
        handleMessage(validatedMessage, sendResponse);
        return true;
      } catch (error) {
        console.error("Invalid message received in content script:", error);
        return false;
      }
    },
  );
}

function handleMessage(
  message: Message,
  sendResponse: (response?: unknown) => void,
): void {
  console.log("Content script received message:", message.type);

  switch (message.type) {
    case "START_ANIMATION":
      handleStartAnimation(message);
      sendResponse({ success: true });
      break;

    case "STOP_ANIMATION":
      handleStopAnimation();
      sendResponse({ success: true });
      break;

    case "UPDATE_ANIMATION_STATE":
      handleUpdateAnimationState(message);
      sendResponse({ success: true });
      break;

    case "GET_ANIMATION_STATE":
      sendResponse(
        createAnimationStateResponseMessage(
          controllerState.currentAnimationState || undefined,
        ),
      );
      break;

    case "RESET_ANIMATION":
      handleResetAnimation();
      sendResponse({ success: true });
      break;

    default:
      console.warn("Unknown message type:", message.type);
      sendResponse({ success: false, error: "Unknown message type" });
  }
}

function handleStartAnimation(message: StartAnimationMessage): void {
  controllerState = startAnimation(controllerState, message.animationState);
  applyAnimation();
  startProgressTracking();
}

function handleStopAnimation(): void {
  controllerState = stopAnimation(controllerState);
  applyAnimation();
  stopProgressTracking();
}

function handleUpdateAnimationState(
  message: UpdateAnimationStateMessage,
): void {
  controllerState = updateAnimationState(
    controllerState,
    message.animationState,
  );
  applyAnimation();

  if (controllerState.currentAnimationState?.isPlaying) {
    startProgressTracking();
  } else {
    stopProgressTracking();
  }
}

function handleResetAnimation(): void {
  controllerState = resetAnimation();
  stopProgressTracking();
  clearStyles();
}

function applyAnimation(): void {
  if (!styleElement) {
    return;
  }

  const styles = generateAnimationStyles(controllerState);
  styleElement.textContent = styles;
}

function startProgressTracking(): void {
  stopProgressTracking();

  if (!controllerState.currentAnimationState?.isPlaying) {
    return;
  }

  const trackProgress = () => {
    if (!controllerState.currentAnimationState?.isPlaying) {
      return;
    }

    controllerState = updateCurrentTime(controllerState);
    const currentTime = calculateCurrentTime(controllerState);

    browser.runtime
      .sendMessage(
        createAnimationProgressMessage(
          currentTime,
          controllerState.currentAnimationState?.isPlaying ?? false,
        ),
      )
      .catch((error) => {
        console.debug("Could not send progress message:", error);
      });

    progressInterval = window.setTimeout(trackProgress, 50);
  };

  progressInterval = window.setTimeout(trackProgress, 50);
}

function stopProgressTracking(): void {
  if (progressInterval !== null) {
    clearTimeout(progressInterval);
    progressInterval = null;
  }
}

function clearStyles(): void {
  if (styleElement) {
    styleElement.textContent = "";
  }
  document.documentElement.style.removeProperty("animation");
  document.documentElement.style.removeProperty("animation-delay");
  document.documentElement.style.removeProperty("transform");
  document.documentElement.style.removeProperty("transform-origin");
  document.documentElement.style.removeProperty("transition");
}

export default defineContentScript({
  matches: ["http://*/*", "https://*/*"],
  main() {
    console.log("Content script loaded");
    initializeStyleElement();
    setupMessageListener();
    console.log("Content script animation controller initialized");
  },
});
