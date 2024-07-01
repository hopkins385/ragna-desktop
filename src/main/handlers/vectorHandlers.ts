import { EmbeddingService } from '../services/embedding.service';
import { ipcMain } from 'electron';
import { globalInferenceService } from '../services/inference.service';
import { globalVectorDbConn } from '../databaseVector/vectorDbConnection';
import { DocumentRepository } from '../repositories/document.repository';
import { DocumentService } from '../services/document.service';

const inferenceService = globalInferenceService;
const documentService = new DocumentService(DocumentRepository);

const embeddingService = new EmbeddingService(
  globalVectorDbConn,
  inferenceService,
  documentService
);

export function handleVectorIPCs() {
  ipcMain.handle(
    'embed-file',
    async (_, path) => await embeddingService.createEmbeddingsForFile({ filePath: path })
  );
  ipcMain.handle(
    'similarity-search',
    async (_, payload) => await embeddingService.similaritySearch({ query: payload.query })
  );
  ipcMain.handle('delete-all-embeddings', async () => await embeddingService.deleteAllEmbeddings());
}
