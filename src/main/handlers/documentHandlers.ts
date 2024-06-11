import { DocumentRepository } from '../repositories';
import { DocumentService } from './../services/document.service';
import { ipcMain } from 'electron';

const documentService = new DocumentService(DocumentRepository);

async function getAllDocuments() {
  return await documentService.getAllDocuments();
}

async function getDocumentById(id: string) {
  return await documentService.getDocumentById(id);
}

async function createNewDocument(payload: {
  title: string;
  content?: string;
  fileName?: string;
  filePath?: string;
}) {
  return await documentService.createNewDocument(payload);
}

async function deleteDocument(id: string) {
  await documentService.deleteDocument(id);
}

export function handleDocumentIPCs() {
  ipcMain.handle('gat-all-documents', async () => await getAllDocuments());
  ipcMain.handle('get-document-by-id', async (_, id: string) => await getDocumentById(id));
  ipcMain.handle(
    'create-new-document',
    async (_, payload: { title: string; content?: string; fileName?: string; filePath?: string }) =>
      await createNewDocument(payload)
  );
  ipcMain.handle('delete-document', async (_, id: string) => await deleteDocument(id));
}
