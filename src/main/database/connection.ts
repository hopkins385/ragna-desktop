import { DataSource } from 'typeorm'
import { getSqliteDbPath } from '../utils/path'
import { User } from './entities/user.entity'
import { logger } from '../utils/logger'

import { Chat, ChatMessage, Embedding, EmbeddingChunk, Document } from './entities'

const sqliteDbPath = getSqliteDbPath()

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: sqliteDbPath,
  entities: [User, Chat, ChatMessage, Document, Embedding, EmbeddingChunk],
  synchronize: true
})

let db: DataSource

async function databaseConnSingleton() {
  if (!db) {
    try {
      const conn = await AppDataSource.initialize()
      db = conn
      console.log('Sqlite database initialized')
    } catch (err) {
      logger.error('Failed to initialize sqlite database: %s', err)
      throw new Error('Failed to initialize sqlite database')
    }
  }
  return db
}

export const globalDatabaseConn = await databaseConnSingleton()
