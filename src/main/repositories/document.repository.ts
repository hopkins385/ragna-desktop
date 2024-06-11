import { globalDatabaseConn } from '../database/connection'
import { Document } from '../database/entities'

export const DocumentRepository = globalDatabaseConn.getRepository(Document)
