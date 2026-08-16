import type {UserSettings} from './types';

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
let initialized = false;

export function configureAnalytics(consent: UserSettings['analyticsConsent']): void {
  if (!measurementId) return;
  window[`ga-disable-${measurementId}`] = consent !== 'granted';
  if (consent !== 'granted' || initialized) return;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = (...args: unknown[]) => window.dataLayer!.push(args);
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false, send_page_view: true});
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  script.dataset.eyeGymAnalytics = 'true';
  document.head.append(script);
  initialized = true;
}

export function track(event: string, parameters: Record<string, string | number | boolean> = {}): void {
  if (!initialized || !measurementId || window[`ga-disable-${measurementId}`]) return;
  window.gtag?.('event', event, parameters);
}
