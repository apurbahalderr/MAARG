"use client";

import { useSyncExternalStore } from "react";

// The "is this the client?" value never changes after hydration, so the
// subscription is a no-op — React only needs the server vs. client snapshots.
const subscribe = () => () => {};

/**
 * Returns `false` during server rendering and the first (hydration) client
 * render, then `true` once mounted in the browser.
 *
 * This lets components read browser-only state (localStorage, `Date.now()`,
 * geolocation, etc.) without a hydration mismatch AND without calling
 * `setState` inside a mount effect — the pattern the React Compiler lint rule
 * `react-hooks/set-state-in-effect` (correctly) flags. `useSyncExternalStore`
 * is the React-sanctioned way to bridge external, client-only state.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true, // client snapshot
    () => false // server snapshot (used during SSR + hydration)
  );
}
