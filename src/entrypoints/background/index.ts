import { browser } from "wxt/browser";
import { storage } from "wxt/utils/storage";
import type { AnimationState } from "@/src/entrypoints/popup/keyframe";
import {
  type AnimationProgressMessage,
  createAnimationStateResponseMessage,
  type Message,
  type StartAnimationMessage,
  type UpdateAnimationStateMessage,
  validateMessage,
} from "@/src/feature/message";

// Storage for animation states per tab URL
const animationStates = storage.defineItem<Record<string, AnimationState>>(
  "local:animationStates",
  {
    defaultValue: {},
  },
);

class BackgroundAnimationManager {
  private tabAnimationStates: Map<number, AnimationState> = new Map();

  constructor() {
    console.log("Background script initialized");
    this.setupMessageListener();
    this.setupTabListeners();
  }

  private setupMessageListener(): void {
    browser.runtime.onMessage.addListener(
      async (message: unknown, sender, sendResponse) => {
        try {
          const validatedMessage = validateMessage(message);
          await this.handleMessage(validatedMessage, sender, sendResponse);
          return true;
        } catch (error) {
          console.error(
            "Invalid message received in background script:",
            error,
          );
          return false;
        }
      },
    );
  }

  private setupTabListeners(): void {
    // When tab is activated, restore animation state
    browser.tabs.onActivated.addListener(async (activeInfo) => {
      await this.restoreAnimationForTab(activeInfo.tabId);
    });

    // When tab is updated (e.g., navigation), restore animation state
    browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (changeInfo.status === "complete" && tab.url) {
        await this.restoreAnimationForTab(tabId);
      }
    });

    // Clean up when tab is removed
    browser.tabs.onRemoved.addListener((tabId) => {
      this.tabAnimationStates.delete(tabId);
    });
  }

  private async handleMessage(
    message: Message,
    sender: { tab?: { id?: number; url?: string } },
    sendResponse: (response?: unknown) => void,
  ): Promise<void> {
    // Handle messages from popup (no tab info) and content scripts (with tab info)
    const isFromPopup = !sender.tab;
    let tabId: number | undefined;
    let url: string | undefined;

    if (isFromPopup) {
      // Get active tab for popup messages
      const [activeTab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      tabId = activeTab?.id;
      url = activeTab?.url;
    } else {
      tabId = sender.tab?.id;
      url = sender.tab?.url;
    }

    console.log(
      "Background received message:",
      message.type,
      "from:",
      isFromPopup ? "popup" : "content",
    );

    switch (message.type) {
      case "START_ANIMATION":
        await this.handleStartAnimation(message, tabId, url);
        sendResponse({ success: true });
        break;

      case "STOP_ANIMATION":
        await this.handleStopAnimation(tabId, url);
        sendResponse({ success: true });
        break;

      case "UPDATE_ANIMATION_STATE":
        await this.handleUpdateAnimationState(message, tabId, url);
        sendResponse({ success: true });
        break;

      case "GET_ANIMATION_STATE": {
        const state = await this.getAnimationState(url);
        sendResponse(createAnimationStateResponseMessage(state));
        break;
      }

      case "ANIMATION_PROGRESS":
        await this.handleAnimationProgress(message, tabId, url);
        sendResponse({ success: true });
        break;

      case "RESET_ANIMATION":
        await this.handleResetAnimation(tabId, url);
        sendResponse({ success: true });
        break;

      default:
        console.warn("Unknown message type:", message.type);
        sendResponse({ success: false, error: "Unknown message type" });
    }
  }

  private async handleStartAnimation(
    message: StartAnimationMessage,
    tabId?: number,
    url?: string,
  ): Promise<void> {
    if (!tabId || !url) return;

    // Store animation state
    this.tabAnimationStates.set(tabId, message.animationState);
    await this.saveAnimationState(url, message.animationState);

    // Forward to content script
    await this.sendMessageToTab(tabId, message);
  }

  private async handleStopAnimation(
    tabId?: number,
    url?: string,
  ): Promise<void> {
    if (!tabId || !url) return;

    const currentState = this.tabAnimationStates.get(tabId);
    if (currentState) {
      const updatedState = { ...currentState, isPlaying: false };
      this.tabAnimationStates.set(tabId, updatedState);
      await this.saveAnimationState(url, updatedState);

      // Forward to content script
      await this.sendMessageToTab(tabId, {
        type: "STOP_ANIMATION",
        timestamp: Date.now(),
      });
    }
  }

  private async handleUpdateAnimationState(
    message: UpdateAnimationStateMessage,
    tabId?: number,
    url?: string,
  ): Promise<void> {
    if (!tabId || !url) return;

    // Store animation state
    this.tabAnimationStates.set(tabId, message.animationState);
    await this.saveAnimationState(url, message.animationState);

    // Forward to content script
    await this.sendMessageToTab(tabId, message);
  }

  private async handleAnimationProgress(
    message: AnimationProgressMessage,
    tabId?: number,
    url?: string,
  ): Promise<void> {
    if (!tabId || !url) return;

    const currentState = this.tabAnimationStates.get(tabId);
    if (currentState) {
      const updatedState = {
        ...currentState,
        currentTime: message.currentTime,
        isPlaying: message.isPlaying,
      };
      this.tabAnimationStates.set(tabId, updatedState);
      await this.saveAnimationState(url, updatedState);

      // Note: We don't forward to popup here as it causes loops
      // Popup will get updates when it queries for current state
    }
  }

  private async handleResetAnimation(
    tabId?: number,
    url?: string,
  ): Promise<void> {
    if (!tabId || !url) return;

    // Remove from memory
    this.tabAnimationStates.delete(tabId);

    // Remove from storage
    const stored = await animationStates.getValue();
    const updatedStored = { ...stored };
    delete updatedStored[url];
    await animationStates.setValue(updatedStored);

    // Forward to content script
    await this.sendMessageToTab(tabId, {
      type: "RESET_ANIMATION",
      timestamp: Date.now(),
    });
  }

  private async restoreAnimationForTab(tabId: number): Promise<void> {
    try {
      const tab = await browser.tabs.get(tabId);
      if (!tab.url) return;

      const savedState = await this.getAnimationState(tab.url);
      if (savedState) {
        this.tabAnimationStates.set(tabId, savedState);

        // Send state to content script
        await this.sendMessageToTab(tabId, {
          type: "UPDATE_ANIMATION_STATE",
          timestamp: Date.now(),
          animationState: savedState,
        });
      }
    } catch (error) {
      console.debug("Could not restore animation for tab:", error);
    }
  }

  private async getAnimationState(
    url?: string,
  ): Promise<AnimationState | undefined> {
    if (!url) return undefined;

    const stored = await animationStates.getValue();
    return stored[url];
  }

  private async saveAnimationState(
    url: string,
    state: AnimationState,
  ): Promise<void> {
    const stored = await animationStates.getValue();
    await animationStates.setValue({
      ...stored,
      [url]: state,
    });
  }

  private async sendMessageToTab(
    tabId: number,
    message: Message,
  ): Promise<void> {
    try {
      await browser.tabs.sendMessage(tabId, message);
    } catch (error) {
      console.debug("Could not send message to tab:", error);
    }
  }
}

// Initialize the background animation manager
export default defineBackground(() => {
  new BackgroundAnimationManager();
});
