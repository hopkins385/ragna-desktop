import { ipcMain } from 'electron';

async function transformerTest2() {
  throw new Error('Not implemented');
}

export function handleTransformerIPCs() {
  ipcMain.handle('transformer-test', async () => await transformerTest2());
}
