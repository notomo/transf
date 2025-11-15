import type { AnimationState } from "../animation-state";

const animationStates = storage.defineItem<
  Record<
    string, // tab url string
    AnimationState
  >
>("local:animationStates", {
  defaultValue: {},
});

export async function getAnimationState(
  url: string,
): Promise<AnimationState | null> {
  const stored = await animationStates.getValue();
  return stored[url] ?? null;
}

export async function saveAnimationState({
  url,
  state,
}: {
  url: string;
  state: AnimationState;
}): Promise<void> {
  const stored = await animationStates.getValue();
  await animationStates.setValue({
    ...stored,
    [url]: state,
  });
}

export async function deleteAnimationState(url: string): Promise<void> {
  const stored = await animationStates.getValue();
  const updatedStored = { ...stored };
  delete updatedStored[url];
  await animationStates.setValue(updatedStored);
}
