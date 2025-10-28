import {
  cleanupTabAnimation,
  handleMessage,
  restoreAnimationForTab,
} from "@/src/feature/message";

export default defineBackground({
  main() {
    // Setup message listener
    browser.runtime.onMessage.addListener(
      (rawMessage, _sender, sendResponse) => {
        handleMessage(rawMessage)
          .then((response) => {
            if (response.type === "message") {
              console.info(response.message);
            } else if (response.type === "response") {
              sendResponse(response.response);
              return;
            }
            sendResponse({ success: true });
          })
          .catch((error) => {
            console.error("Error handling message:", error);
            sendResponse({ success: false, error: error.message });
          });
        // Return true to indicate async response
        return true;
      },
    );

    // Setup tab listeners
    // When tab is activated, restore animation state
    browser.tabs.onActivated.addListener(async (activeInfo) => {
      await restoreAnimationForTab(activeInfo.tabId);
    });

    // When tab is updated (e.g., navigation), restore animation state
    browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (changeInfo.status === "complete" && tab.url) {
        await restoreAnimationForTab(tabId);
      }
    });

    // Clean up when tab is removed
    browser.tabs.onRemoved.addListener((tabId) => {
      cleanupTabAnimation(tabId);
    });
  },
});
