/**
 * Web Vitals / CWV reporting for LCP, INP, CLS (see docs/PERFORMANCE.md).
 * Call from main.tsx; plug in your analytics (e.g. Vercel Analytics, Google Analytics).
 * No-op by default — set REPORT_WEB_VITALS or pass an onReport callback to send data.
 */

export interface WebVitalMetric {
  name: 'LCP' | 'INP' | 'CLS' | 'FCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType?: string;
}

type ReportCallback = (metric: WebVitalMetric) => void;

function getRating(name: string, value: number): WebVitalMetric['rating'] {
  switch (name) {
    case 'LCP':
      return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
    case 'INP':
    case 'FID':
      return value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
    case 'CLS':
      return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
    case 'FCP':
      return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
    case 'TTFB':
      return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
    default:
      return 'good';
  }
}

function reportToAnalytics(metric: WebVitalMetric) {
  if (typeof window === 'undefined') return;
  // Plug in your RUM provider, e.g.:
  // if (window.gtag) window.gtag('event', metric.name, { value: metric.value, event_category: 'Web Vitals' });
  // if (window.va) window.va('event', { name: metric.name, value: metric.value });
  if (import.meta.env.DEV && metric.rating !== 'good') {
    console.log('[Web Vitals]', metric.name, metric.value, metric.rating);
  }
}

export function reportWebVitals(onReport?: ReportCallback) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  const report = (name: WebVitalMetric['name'], value: number) => {
    const payload: WebVitalMetric = {
      name,
      value,
      rating: getRating(name, value),
      delta: value,
      id: `v1-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      navigationType: window.performance.getEntriesByType?.('navigation')[0]?.type,
    };
    onReport?.(payload);
    reportToAnalytics(payload);
  };

  try {
    // LCP: use renderTime or startTime (ms)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number };
      if (last) {
        const value = last.renderTime ?? last.startTime;
        report('LCP', value);
      }
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

    // First Input Delay (proxy for INP when INP not available)
    const fidObserver = new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        const duration = (e as PerformanceEntry & { duration: number }).duration;
        if (typeof duration === 'number') report('INP', duration);
      }
    });
    fidObserver.observe({ type: 'first-input', buffered: true });

    // CLS: cumulative layout shift (report on each update with total)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const e = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!e.hadRecentInput) clsValue += e.value ?? 0;
      }
      report('CLS', clsValue);
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch {
    // Older browsers or missing APIs
  }
}
