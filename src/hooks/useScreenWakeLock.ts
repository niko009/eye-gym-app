import {useEffect} from 'react';

/** Keeps the display awake while the owning screen is active and visible. */
export function useScreenWakeLock(enabled: boolean): void {
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return;

    let cancelled = false;
    let requesting = false;
    let sentinel: WakeLockSentinel | null = null;

    const requestLock = async () => {
      if (cancelled || requesting || sentinel || document.visibilityState !== 'visible') return;
      requesting = true;
      try {
        const acquired = await navigator.wakeLock.request('screen');
        if (cancelled || document.visibilityState !== 'visible') {
          await acquired.release();
          return;
        }

        sentinel = acquired;
        acquired.addEventListener('release', () => {
          if (sentinel === acquired) sentinel = null;
        }, {once: true});
      } catch {
        // Battery-saving modes and browser policy may reject the request.
        // The workout remains fully usable without the optional wake lock.
      } finally {
        requesting = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void requestLock();
    };

    void requestLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      const activeSentinel = sentinel;
      sentinel = null;
      void activeSentinel?.release().catch(() => undefined);
    };
  }, [enabled]);
}
