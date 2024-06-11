import { globalDatabaseConn } from '../database/connection';
import { Embedding } from '../database/entities';

export const EmbeddingRepository = globalDatabaseConn.getRepository(Embedding);
