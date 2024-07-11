import { ipcMain } from 'electron';
import { trackEvent } from '../utils/analytics';

export function handleAnalyticsIPCs() {
  ipcMain.handle('track-event', async (_, actionName) => await trackEvent(actionName));
}
