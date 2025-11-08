import { handleMessageInBackground } from "@/src/feature/message";
import { restoreAnimationForTab } from "@/src/feature/message/update-animation-state";

export default defineBackground({
  main() {
    browser.runtime.onMessage.addListener(
      (rawMessage, _sender, sendResponse) => {
        handleMessageInBackground(rawMessage).then((response) => {
          const typ = response.type;
          switch (typ) {
            case "message":
              console.info(response.message);
              sendResponse({ success: true });
              return;
            case "response":
              console.info(`received response for: ${response.messageType}`);
              sendResponse(response.body);
              return;
            default:
              throw new Error(
                `unexpected message type: ${typ satisfies never}`,
              );
          }
        });
        // Return true to indicate async response
        return true;
      },
    );

    browser.tabs.onActivated.addListener(async (activeInfo) => {
      await restoreAnimationForTab(activeInfo.tabId);
    });

    browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (changeInfo.status === "complete" && tab.url) {
        await restoreAnimationForTab(tabId);
      }
    });
  },
});
