import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

if (!globalThis.crypto.randomUUID) {
  Object.defineProperty(globalThis.crypto, 'randomUUID', {
    value: () => '00000000-0000-4000-8000-000000000000',
  });
}

if (!globalThis.IntersectionObserver) {
  class IntersectionObserverMock implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = '0px';
    readonly thresholds = [0];
    disconnect() {}
    observe() {}
    unobserve() {}
    takeRecords(): IntersectionObserverEntry[] { return [] }
  }
  Object.defineProperty(globalThis, 'IntersectionObserver', {value: IntersectionObserverMock});
}
