"use client";

import { useSyncExternalStore } from "react";

/** No client-side store to watch — the value only ever changes at hydration. */
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * `false` while rendering on the server and during the hydration pass, `true`
 * afterwards.
 *
 * Use it to gate anything whose value is only knowable in the browser (theme,
 * `document`, viewport) so the first client render stays byte-identical to the
 * server's — React discards the entire client tree on a mismatch, which
 * silently breaks every interactive element on the page.
 *
 * Preferred over the `useState` + `useEffect` mount flag: that pattern trips
 * `react-hooks/set-state-in-effect` and schedules an extra render pass.
 */
export function useHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
