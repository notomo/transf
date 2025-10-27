import { browser } from "wxt/browser";
import type { AnimationState } from "@/src/entrypoints/popup/keyframe";
import {
  type CSSAnimationConfig,
  generateCSSKeyframes,
  generateStaticTransformCSS,
  hasKeyframes,
} from "@/src/feature/css-keyframe";
import {
  createAnimationProgressMessage,
  createAnimationStateResponseMessage,
  type Message,
  type StartAnimationMessage,
  type UpdateAnimationStateMessage,
  validateMessage,
} from "@/src/feature/message";

class AnimationController {
  private styleElement: HTMLStyleElement | null = null;
  private currentAnimationConfig: CSSAnimationConfig | null = null;
  private currentAnimationState: AnimationState | null = null;
  private progressInterval: number | null = null;
  private animationStartTime: number = 0;

  constructor() {
    console.log("Content script AnimationController initialized");
    this.initializeStyleElement();
    this.setupMessageListener();
  }

  private initializeStyleElement(): void {
    this.styleElement = document.createElement("style");
    this.styleElement.id = "transf-animation-styles";
    document.head.appendChild(this.styleElement);
  }

  private setupMessageListener(): void {
    browser.runtime.onMessage.addListener(
      (message: unknown, _sender, sendResponse) => {
        try {
          const validatedMessage = validateMessage(message);
          this.handleMessage(validatedMessage, sendResponse);
          return true; // Keep the message port open for async response
        } catch (error) {
          console.error("Invalid message received in content script:", error);
          return false;
        }
      },
    );
  }

  private handleMessage(
    message: Message,
    sendResponse: (response?: unknown) => void,
  ): void {
    console.log("Content script received message:", message.type);

    switch (message.type) {
      case "START_ANIMATION":
        this.startAnimation(message);
        sendResponse({ success: true });
        break;

      case "STOP_ANIMATION":
        this.stopAnimation();
        sendResponse({ success: true });
        break;

      case "UPDATE_ANIMATION_STATE":
        this.updateAnimationState(message);
        sendResponse({ success: true });
        break;

      case "GET_ANIMATION_STATE":
        sendResponse(
          createAnimationStateResponseMessage(
            this.currentAnimationState || undefined,
          ),
        );
        break;

      case "RESET_ANIMATION":
        this.resetAnimation();
        sendResponse({ success: true });
        break;

      default:
        console.warn("Unknown message type:", message.type);
        sendResponse({ success: false, error: "Unknown message type" });
    }
  }

  private startAnimation(message: StartAnimationMessage): void {
    this.currentAnimationState = message.animationState;
    this.applyAnimation();
    this.startProgressTracking();
  }

  private stopAnimation(): void {
    if (this.currentAnimationState) {
      this.currentAnimationState.isPlaying = false;
      this.applyAnimation();
    }
    this.stopProgressTracking();
  }

  private updateAnimationState(message: UpdateAnimationStateMessage): void {
    this.currentAnimationState = message.animationState;
    this.applyAnimation();

    if (this.currentAnimationState.isPlaying) {
      this.startProgressTracking();
    } else {
      this.stopProgressTracking();
    }
  }

  private resetAnimation(): void {
    this.currentAnimationState = null;
    this.currentAnimationConfig = null;
    this.stopProgressTracking();
    this.clearStyles();
  }

  private applyAnimation(): void {
    if (!this.currentAnimationState || !this.styleElement) {
      return;
    }

    if (hasKeyframes(this.currentAnimationState)) {
      // Use CSS keyframes animation
      this.currentAnimationConfig = generateCSSKeyframes(
        this.currentAnimationState,
      );
      this.styleElement.textContent = `
        ${this.currentAnimationConfig.keyframesRule}
        
        html {
          animation: ${this.currentAnimationConfig.animationProperty} !important;
        }
      `;

      // Set animation delay based on current time
      const delay =
        -this.currentAnimationState.currentTime *
        this.currentAnimationState.duration;
      document.documentElement.style.setProperty(
        "animation-delay",
        `${delay}ms`,
        "important",
      );
    } else {
      // Use static transform
      const staticCSS = generateStaticTransformCSS(this.currentAnimationState);
      this.styleElement.textContent = `
        html {
          ${staticCSS}
        }
      `;
    }

    this.animationStartTime =
      Date.now() -
      this.currentAnimationState.currentTime *
        this.currentAnimationState.duration;
  }

  private startProgressTracking(): void {
    this.stopProgressTracking();

    if (!this.currentAnimationState?.isPlaying) {
      return;
    }

    const trackProgress = () => {
      if (!this.currentAnimationState?.isPlaying) {
        return;
      }

      const elapsed = Date.now() - this.animationStartTime;
      const duration = this.currentAnimationState.duration;
      const currentTime = (elapsed % duration) / duration;

      // Update current time
      this.currentAnimationState.currentTime = currentTime;

      // Send progress update to background script
      browser.runtime
        .sendMessage(
          createAnimationProgressMessage(
            currentTime,
            this.currentAnimationState.isPlaying,
          ),
        )
        .catch((error) => {
          // Ignore errors if background script is not available
          console.debug("Could not send progress message:", error);
        });

      this.progressInterval = window.setTimeout(trackProgress, 50); // Update every 50ms
    };

    this.progressInterval = window.setTimeout(trackProgress, 50);
  }

  private stopProgressTracking(): void {
    if (this.progressInterval !== null) {
      clearTimeout(this.progressInterval);
      this.progressInterval = null;
    }
  }

  private clearStyles(): void {
    if (this.styleElement) {
      this.styleElement.textContent = "";
    }
    document.documentElement.style.removeProperty("animation");
    document.documentElement.style.removeProperty("animation-delay");
    document.documentElement.style.removeProperty("transform");
    document.documentElement.style.removeProperty("transform-origin");
    document.documentElement.style.removeProperty("transition");
  }
}

// Initialize the animation controller when the content script loads
export default defineContentScript({
  matches: ["http://*/*", "https://*/*"],
  main() {
    console.log("Content script loaded");
    new AnimationController();
  },
});
