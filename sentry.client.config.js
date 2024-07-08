import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/browser'; // Import from @sentry/browser

const SENTRY_DSN = 'YOUR_SENTRY_DSN'; // Replace with your Sentry DSN

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [
    new BrowserTracing({
      tracingOrigins: ['localhost', 'your-production-domain.com'], // Set your production domain
      routingInstrumentation: Sentry.routingInstrumentation,
    }),
  ],

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,

  // Enable native crash reports for React Native
  enableNative: true,
});