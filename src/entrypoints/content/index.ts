export default defineContentScript({
  matches: ["http://*/*", "https://*/*"],
  main() {
    const applyRotation = (
      centerX: number,
      centerY: number,
      rotation: number,
    ) => {
      const style = `
        transform-origin: ${centerX}% ${centerY}%;
        transform: rotate(${rotation}deg);
        transition: transform 0.3s ease;
      `;
      document.documentElement.style.cssText = style;
    };

    const resetRotation = () => {
      document.documentElement.style.cssText = "";
    };

    browser.runtime.onMessage.addListener((message) => {
      if (message.action === "rotate") {
        applyRotation(message.centerX, message.centerY, message.rotation);
      } else if (message.action === "reset") {
        resetRotation();
      }
    });
  },
});
