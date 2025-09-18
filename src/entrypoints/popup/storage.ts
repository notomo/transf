export type TransformState = {
  centerX: number;
  centerY: number;
  rotation: number;
  scale: number;
  translateX: number;
  translateY: number;
};

export const DEFAULT_TRANSFORM: TransformState = {
  centerX: 50,
  centerY: 50,
  rotation: 0,
  scale: 1,
  translateX: 0,
  translateY: 0,
};

export const transformStateItem = storage.defineItem<TransformState>(
  "session:transformState",
  {
    defaultValue: DEFAULT_TRANSFORM,
  },
);

export async function getTransformState(): Promise<TransformState> {
  return await transformStateItem.getValue();
}

export async function setTransformState(state: TransformState): Promise<void> {
  await transformStateItem.setValue(state);
}
