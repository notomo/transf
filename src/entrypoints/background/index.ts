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
            const typ = response.type;
            switch (typ) {
              case "message":
                console.info(response.message);
                sendResponse({ success: true });
                break;
              case "response":
                sendResponse(response.response);
                break;
              default:
                typ satisfies never;
                sendResponse({ success: true });
            }
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
