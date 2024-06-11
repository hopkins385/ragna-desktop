import { EmbeddingService } from './../services/embedding.service'
import { ipcMain } from 'electron'
import { globalInferenceService } from '../services/inference.service'
import { globalVectorDbConn } from '../databaseVector/vectorDbConnection'
import { DocumentRepository } from '../repositories/document.repository'
import { DocumentService } from '../services/document.service'
import { EmbeddingRepository } from '../repositories'

const inferenceService = globalInferenceService
const documentService = new DocumentService(DocumentRepository)

const embeddingService = new EmbeddingService(
  globalVectorDbConn,
  EmbeddingRepository,
  inferenceService,
  documentService
)

export function handleVectorIPCs() {
  ipcMain.handle('embed-file', async (_, path) => await embeddingService.embedFile(path))
  ipcMain.handle(
    'semantic-search',
    async (_, payload) => await embeddingService.search(payload.query)
  )
  ipcMain.handle('delete-all-embeddings', async () => await embeddingService.deleteAllEmbeddings())
}
