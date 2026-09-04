import "@testing-library/jest-dom";
import * as matchers from "vitest-axe/matchers";
import { beforeEach, expect, vi } from "vitest";
expect.extend(matchers);

// Unit/component tests must not depend on live geolocation/prayer services.
// Individual tests replace this offline response with their own API fixtures.
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: false, status: 503, statusText: 'Offline test fixture',
    json: async () => ({ error: 'Offline test fixture' }),
    text: async () => 'Offline test fixture',
  } as Response)));
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList,
});

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: readonly number[] = [];
  readonly scrollMargin: string = "0px";
  observe = (): void => {};
  unobserve = (): void => {};
  disconnect = (): void => {};
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: MockIntersectionObserver,
});

class MockResizeObserver implements ResizeObserver {
  observe = () => {};
  unobserve = () => {};
  disconnect = () => {};
}
Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: MockResizeObserver,
});

if (typeof URL.createObjectURL === "undefined") {
  URL.createObjectURL = () => "blob:mock-url";
}
if (typeof URL.revokeObjectURL === "undefined") {
  URL.revokeObjectURL = () => {};
}
