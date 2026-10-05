import type { Locator, Page } from "@playwright/test";
import * as v from "valibot";
import {
  type AnimationState,
  DEFAULT_ANIMATION,
} from "../src/feature/animation-state";
import { ShowGizmoResponseSchema } from "../src/feature/message/show-gizmo";
import { expect, test } from "./fixtures";
import {
  getStoredAnimationState,
  openTestPage,
  sendAnimationStateToContent,
  sendShowGizmoToContent,
  setGizmoEnabled,
} from "./pages/content";

const url = "https://transf.test/";

async function getCenter(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("element not found");
  }
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function drag({
  page,
  from,
  to,
}: {
  page: Page;
  from: { x: number; y: number };
  to: { x: number; y: number };
}) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 5 });
  await page.mouse.up();
}

async function getRootMatrix(page: Page) {
  return await page.evaluate(() => {
    const matrix = new DOMMatrix(
      getComputedStyle(document.documentElement).transform,
    );
    return { a: matrix.a, b: matrix.b, e: matrix.e, f: matrix.f };
  });
}

async function setup({
  page,
  serviceWorker,
  animationState = DEFAULT_ANIMATION,
}: {
  page: Page;
  serviceWorker: Parameters<
    typeof sendAnimationStateToContent
  >[0]["serviceWorker"];
  animationState?: AnimationState;
}) {
  await openTestPage({ page, url });
  await sendAnimationStateToContent({ serviceWorker, url, animationState });
  const moveHandle = page.getByTestId("transf-gizmo-move");
  await expect(moveHandle).toBeVisible();
  return { moveHandle };
}

test("moves page by dragging move handle", async ({ page, serviceWorker }) => {
  const { moveHandle } = await setup({ page, serviceWorker });

  const from = await getCenter(moveHandle);
  await drag({ page, from, to: { x: from.x + 100, y: from.y + 50 } });

  await expect
    .poll(() => getRootMatrix(page))
    .toMatchObject({ a: 1, b: 0, e: 100, f: 50 });
  await expect
    .poll(async () => {
      const state = await getStoredAnimationState({ serviceWorker, url });
      return state?.baseTransform;
    })
    .toMatchObject({ translateX: 100, translateY: 50 });

  // The handle follows the pivot.
  // Expected pivot is read from the page because a scrollbar may appear and change the root width.
  const expected = await page.evaluate(() => {
    const root = document.documentElement;
    return {
      x: root.offsetWidth / 2 + 100 - window.scrollX,
      y: root.offsetHeight / 2 + 50 - window.scrollY,
    };
  });
  const moved = await getCenter(moveHandle);
  expect(moved.x).toBeCloseTo(expected.x);
  expect(moved.y).toBeCloseTo(expected.y);
});

test("moves page only along axis by dragging arrow", async ({
  page,
  serviceWorker,
}) => {
  await setup({ page, serviceWorker });

  const from = await getCenter(page.getByTestId("transf-gizmo-move-x"));
  await drag({ page, from, to: { x: from.x + 80, y: from.y + 40 } });

  await expect.poll(() => getRootMatrix(page)).toMatchObject({ e: 80, f: 0 });
});

test("rotates page by dragging ring", async ({ page, serviceWorker }) => {
  const { moveHandle } = await setup({ page, serviceWorker });

  const pivot = await getCenter(moveHandle);
  // Drag the upper part of the ring from upper-left to upper-right to avoid other handles.
  const offset = 70 / Math.SQRT2;
  await drag({
    page,
    from: { x: pivot.x - offset, y: pivot.y - offset },
    to: { x: pivot.x + offset, y: pivot.y - offset },
  });

  await expect
    .poll(async () => {
      const state = await getStoredAnimationState({ serviceWorker, url });
      return Math.round(state?.baseTransform.rotation ?? 0);
    })
    .toBe(90);
});

test("scales page by dragging scale handle", async ({
  page,
  serviceWorker,
}) => {
  const { moveHandle } = await setup({ page, serviceWorker });

  const pivot = await getCenter(moveHandle);
  const from = await getCenter(page.getByTestId("transf-gizmo-scale"));
  await drag({
    page,
    from,
    to: { x: 2 * from.x - pivot.x, y: 2 * from.y - pivot.y },
  });

  await expect
    .poll(async () => {
      const state = await getStoredAnimationState({ serviceWorker, url });
      return Math.round((state?.baseTransform.scale ?? 0) * 100) / 100;
    })
    .toBe(2);
});

test("moves pivot without moving page by alt+dragging move handle", async ({
  page,
  serviceWorker,
}) => {
  const { moveHandle } = await setup({
    page,
    serviceWorker,
    animationState: {
      ...DEFAULT_ANIMATION,
      baseTransform: {
        ...DEFAULT_ANIMATION.baseTransform,
        rotation: 30,
        scale: 0.5,
      },
    },
  });
  // Wait for the transition to finish.
  await expect.poll(() => getRootMatrix(page)).not.toMatchObject({ b: 0 });
  await page.waitForTimeout(400);
  const mainBefore = await page.locator("main").boundingBox();

  const from = await getCenter(moveHandle);
  const to = { x: from.x - 200, y: from.y - 100 };
  await page.keyboard.down("Alt");
  await drag({ page, from, to });
  await page.keyboard.up("Alt");

  await expect
    .poll(async () => {
      const state = await getStoredAnimationState({ serviceWorker, url });
      return state?.baseTransform.centerX ?? 50;
    })
    .not.toBe(50);
  await page.waitForTimeout(400);

  const mainAfter = await page.locator("main").boundingBox();
  expect(mainAfter?.x).toBeCloseTo(mainBefore?.x ?? Number.NaN, 0);
  expect(mainAfter?.y).toBeCloseTo(mainBefore?.y ?? Number.NaN, 0);
  const pivot = await getCenter(moveHandle);
  expect(pivot.x).toBeCloseTo(to.x, 0);
  expect(pivot.y).toBeCloseTo(to.y, 0);
});

test("moves pivot only along axis in pivot mode", async ({
  page,
  serviceWorker,
}) => {
  const { moveHandle } = await setup({
    page,
    serviceWorker,
    animationState: {
      ...DEFAULT_ANIMATION,
      baseTransform: {
        ...DEFAULT_ANIMATION.baseTransform,
        rotation: 30,
        scale: 0.5,
      },
    },
  });
  // Wait for the transition to finish.
  await page.waitForTimeout(400);
  const mainBefore = await page.locator("main").boundingBox();

  const toggle = page.getByTestId("transf-gizmo-pivot-mode");
  await toggle.click();
  await expect(toggle).toHaveAttribute("data-active", "true");

  const pivotBefore = await getCenter(moveHandle);
  const from = await getCenter(page.getByTestId("transf-gizmo-move-x"));
  await drag({ page, from, to: { x: from.x + 80, y: from.y + 40 } });

  await expect
    .poll(async () => {
      const pivot = await getCenter(moveHandle);
      return {
        x: Math.round(pivot.x - pivotBefore.x),
        y: Math.round(pivot.y - pivotBefore.y),
      };
    })
    .toEqual({ x: 80, y: 0 });
  await page.waitForTimeout(400);
  const mainAfter = await page.locator("main").boundingBox();
  expect(mainAfter?.x).toBeCloseTo(mainBefore?.x ?? Number.NaN, 0);
  expect(mainAfter?.y).toBeCloseTo(mainBefore?.y ?? Number.NaN, 0);
});

test("moves page by alt+dragging in pivot mode", async ({
  page,
  serviceWorker,
}) => {
  const { moveHandle } = await setup({ page, serviceWorker });

  await page.getByTestId("transf-gizmo-pivot-mode").click();

  const from = await getCenter(moveHandle);
  await page.keyboard.down("Alt");
  await drag({ page, from, to: { x: from.x + 100, y: from.y + 50 } });
  await page.keyboard.up("Alt");

  await expect
    .poll(async () => {
      const state = await getStoredAnimationState({ serviceWorker, url });
      return state?.baseTransform;
    })
    .toMatchObject({
      translateX: 100,
      translateY: 50,
      centerX: 50,
      centerY: 50,
    });
});

test("cancels drag by escape", async ({ page, serviceWorker }) => {
  const { moveHandle } = await setup({ page, serviceWorker });

  const from = await getCenter(moveHandle);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 100, from.y + 50, { steps: 5 });
  await expect.poll(() => getRootMatrix(page)).toMatchObject({ e: 100 });

  await page.keyboard.press("Escape");
  await page.mouse.up();

  await expect.poll(() => getRootMatrix(page)).toMatchObject({ e: 0, f: 0 });
  const state = await getStoredAnimationState({ serviceWorker, url });
  expect(state).toBeUndefined();
});

test("hides gizmo when disabled", async ({ page, serviceWorker }) => {
  const { moveHandle } = await setup({ page, serviceWorker });

  await setGizmoEnabled({ serviceWorker, enabled: false });
  await expect(moveHandle).not.toBeAttached();

  await setGizmoEnabled({ serviceWorker, enabled: true });
  await expect(moveHandle).toBeVisible();
});

async function getViewportCenter(page: Page) {
  return await page.evaluate(() => {
    const element = document.scrollingElement ?? document.documentElement;
    return { x: element.clientWidth / 2, y: element.clientHeight / 2 };
  });
}

test("shows gizmo at viewport center without transform when requested", async ({
  page,
  serviceWorker,
}) => {
  await openTestPage({ page, url, mainHeight: "5000px" });
  await page.evaluate(() => window.scrollTo(0, 2000));

  const initial = v.parse(
    ShowGizmoResponseSchema,
    await sendShowGizmoToContent({ serviceWorker, url }),
  );
  const moveHandle = page.getByTestId("transf-gizmo-move");
  await expect(moveHandle).toBeVisible();
  await expect(page.locator("#transf-animation-styles")).not.toBeAttached();

  const center = await getViewportCenter(page);
  const from = await getCenter(moveHandle);
  expect(from.x).toBeCloseTo(center.x, 0);
  expect(from.y).toBeCloseTo(center.y, 0);

  await drag({ page, from, to: { x: from.x + 50, y: from.y } });

  await expect
    .poll(async () => {
      const state = await getStoredAnimationState({ serviceWorker, url });
      return state?.baseTransform.translateX;
    })
    .toBe(50);
  // The initial pivot is saved with the first edit.
  const state = await getStoredAnimationState({ serviceWorker, url });
  expect(state?.baseTransform.centerY).toBe(
    initial.initialAnimationState?.baseTransform.centerY,
  );
  expect(state?.baseTransform.centerY).not.toBe(50);
});

test("restores no transform when cancelling drag from initial state", async ({
  page,
  serviceWorker,
}) => {
  await openTestPage({ page, url });
  await sendShowGizmoToContent({ serviceWorker, url });
  const moveHandle = page.getByTestId("transf-gizmo-move");
  await expect(moveHandle).toBeVisible();

  const from = await getCenter(moveHandle);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 100, from.y, { steps: 5 });
  await expect(page.locator("#transf-animation-styles")).toBeAttached();

  await page.keyboard.press("Escape");
  await page.mouse.up();

  await expect(page.locator("#transf-animation-styles")).not.toBeAttached();
  await expect(moveHandle).toBeVisible();
});

for (const quirksMode of [false, true]) {
  test(`scrolls to offscreen gizmo by indicator (quirks mode: ${quirksMode})`, async ({
    page,
    serviceWorker,
  }) => {
    await openTestPage({ page, url, mainHeight: "5000px", quirksMode });
    await sendAnimationStateToContent({
      serviceWorker,
      url,
      animationState: DEFAULT_ANIMATION,
    });

    const indicator = page.getByTestId("transf-gizmo-indicator");
    await expect(indicator).toBeVisible();

    await indicator.click();

    await expect(indicator).not.toBeAttached();
    const center = await getViewportCenter(page);
    await expect
      .poll(async () => {
        const pivot = await getCenter(page.getByTestId("transf-gizmo-move"));
        return Math.round(pivot.y - center.y);
      })
      .toBe(0);
  });
}

test("moves pivot vertically on page whose root element has no height", async ({
  page,
  serviceWorker,
}) => {
  await openTestPage({ page, url, mainHeight: "5000px", absoluteMain: true });
  await page.evaluate(() => window.scrollTo(0, 2000));
  expect(await page.evaluate(() => document.documentElement.offsetHeight)).toBe(
    0,
  );

  await sendShowGizmoToContent({ serviceWorker, url });
  const moveHandle = page.getByTestId("transf-gizmo-move");
  await expect(moveHandle).toBeVisible();

  const center = await getViewportCenter(page);
  const pivotBefore = await getCenter(moveHandle);
  expect(pivotBefore.x).toBeCloseTo(center.x, 0);
  expect(pivotBefore.y).toBeCloseTo(center.y, 0);

  await page.getByTestId("transf-gizmo-pivot-mode").click();
  const from = await getCenter(page.getByTestId("transf-gizmo-move-y"));
  await drag({ page, from, to: { x: from.x, y: from.y - 100 } });

  await expect
    .poll(async () => {
      const pivot = await getCenter(moveHandle);
      return Math.round(pivot.y - pivotBefore.y);
    })
    .toBe(-100);
  await page.waitForTimeout(400);
  const main = await page.locator("main").boundingBox();
  expect(main?.y).toBeCloseTo(-2000, 0);
});

test("shows gizmo when popup is opened", async ({
  page,
  context,
  extensionId,
}) => {
  await openTestPage({ page, url, mainHeight: "5000px" });
  await page.evaluate(() => window.scrollTo(0, 2000));

  // Open the popup in a background tab so that the test page stays the active tab.
  const popupPage = await context.newPage();
  await page.bringToFront();
  await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);

  await expect(page.getByTestId("transf-gizmo-move")).toBeVisible();
  // The popup uses the initial pivot at the viewport center.
  await expect(
    popupPage.getByRole("slider", { name: /Center Y/ }),
  ).not.toHaveValue("50");
});
