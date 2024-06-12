import * as Sentry from '@sentry/electron';
import { is } from '@electron-toolkit/utils';

export function initSentry() {
  if (is.dev) return;
  try {
    Sentry.init({
      dsn: 'https://130a654cd925cfbdc6e216c23c66f3d3@o4507418919960576.ingest.de.sentry.io/4507418922123344'
    });
    console.log('Sentry initialized');
  } catch (error) {
    console.error('Failed to initialize Sentry', error);
  }
}

export function handleSentryIPCs() {}
