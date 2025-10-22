import type { TransformState } from "./keyframe";

async function applyCSS(style: string) {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  const tabId = tab?.id;
  if (!tabId) {
    return;
  }

  await browser.scripting.executeScript({
    target: { tabId },
    args: [
      {
        style,
      },
    ],
    func: (args) => {
      document.documentElement.style.cssText = args.style;
    },
  });
}

export async function applyTransformCSS({
  transform,
  animated = false,
}: {
  transform: TransformState | null;
  animated?: boolean;
}) {
  if (transform === null) {
    applyCSS("");
    return;
  }

  const scaleX = transform.flipHorizontal ? -transform.scale : transform.scale;
  const scaleY = transform.flipVertical ? -transform.scale : transform.scale;

  const style = `
transform-origin: ${transform.centerX}% ${transform.centerY}%;
transform: translate(${transform.translateX}px, ${transform.translateY}px) rotate(${transform.rotation}deg) scale(${scaleX}, ${scaleY});
${animated ? "" : "transition: transform 0.3s ease;"}
`;
  await applyCSS(style);
}
