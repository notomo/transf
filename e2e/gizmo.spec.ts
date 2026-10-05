import type { Locator, Page } from "@playwright/test";
import {
  type AnimationState,
  DEFAULT_ANIMATION,
} from "../src/feature/animation-state";
import { expect, test } from "./fixtures";
import {
  getStoredAnimationState,
  openTestPage,
  sendAnimationStateToContent,
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
