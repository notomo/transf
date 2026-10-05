import { useEffect, useState } from "react";

export const gizmoEnabled = storage.defineItem<boolean>("local:gizmoEnabled", {
  fallback: true,
});

export async function toggleGizmoEnabled(): Promise<void> {
  const enabled = await gizmoEnabled.getValue();
  await gizmoEnabled.setValue(!enabled);
}

// Returns undefined until the stored value is loaded.
export function useGizmoEnabled(): boolean | undefined {
  const [enabled, setEnabled] = useState<boolean>();

  useEffect(() => {
    gizmoEnabled.getValue().then(setEnabled);
    return gizmoEnabled.watch(setEnabled);
  }, []);

  return enabled;
}
