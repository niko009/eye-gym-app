import {act, cleanup, render, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {useScreenWakeLock} from './useScreenWakeLock';

class WakeLockSentinelMock extends EventTarget {
  released = false;

  release = vi.fn(async () => {
    if (this.released) return;
    this.released = true;
    this.dispatchEvent(new Event('release'));
  });
}

function Harness({enabled = true}: {enabled?: boolean}) {
  useScreenWakeLock(enabled);
  return null;
}

function setVisibility(value: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', {configurable: true, value});
}

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(navigator, 'wakeLock');
  setVisibility('visible');
  vi.restoreAllMocks();
});

describe('useScreenWakeLock', () => {
  it('requests a screen lock and releases it when the workout closes', async () => {
    const sentinel = new WakeLockSentinelMock();
    const request = vi.fn(async () => sentinel);
    Object.defineProperty(navigator, 'wakeLock', {configurable: true, value: {request}});

    const view = render(<Harness />);
    await waitFor(() => expect(request).toHaveBeenCalledWith('screen'));

    view.unmount();
    await waitFor(() => expect(sentinel.release).toHaveBeenCalledOnce());
  });

  it('requests a new lock after returning to the visible workout', async () => {
    const first = new WakeLockSentinelMock();
    const second = new WakeLockSentinelMock();
    const request = vi.fn()
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(second);
    Object.defineProperty(navigator, 'wakeLock', {configurable: true, value: {request}});

    render(<Harness />);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));

    setVisibility('hidden');
    await act(() => first.release());
    setVisibility('visible');
    act(() => document.dispatchEvent(new Event('visibilitychange')));

    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  });

  it('does nothing in browsers without Wake Lock support', () => {
    expect(() => render(<Harness />)).not.toThrow();
  });
});
