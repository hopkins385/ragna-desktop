import * as lancedb from 'vectordb';
import { getVectorDbPath } from '../utils/path';
import { logger } from '../utils/logger';

const dbFilePath = getVectorDbPath();

let vectorDbConn: lancedb.Connection;

async function vectorDbSingleton() {
  if (!vectorDbConn) {
    try {
      const conn = await lancedb.connect(dbFilePath);
      vectorDbConn = conn;
      console.log('Vector database initialized');
    } catch (err) {
      logger.error('Failed to initialize vector database: %s', err);
      throw new Error('Failed to initialize vector database');
    }
  }

  return vectorDbConn;
}

export const globalVectorDbConn = await vectorDbSingleton();
