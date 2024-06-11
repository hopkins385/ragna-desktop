export default function useDocuments() {
  async function getAllDocuments() {
    const docs = await window.electron.ipcRenderer.invoke('gat-all-documents')
    return docs
  }

  async function getDocumentById(id: string) {
    const doc = await window.electron.ipcRenderer.invoke('get-document-by-id', id)
    return doc
  }

  async function createNewDocument(payload: {
    title: string
    content?: string
    fileName?: string
    filePath?: string
  }) {
    const doc = await window.electron.ipcRenderer.invoke('create-new-document', payload)
    return doc
  }

  async function deleteDocument(id: string) {
    await window.electron.ipcRenderer.invoke('delete-document', id)
  }

  return {
    getAllDocuments,
    getDocumentById,
    createNewDocument,
    deleteDocument
  }
}
