import { Document } from '../database/entities';
import { Repository } from 'typeorm';

export class DocumentService {
  constructor(private documentRepository: Repository<Document>) {}

  async getAllDocuments(): Promise<Document[]> {
    return this.documentRepository.find({
      select: {
        id: true,
        title: true,
        fileName: true,
        filePath: true,
        createdAt: true,
        embedding: {
          id: true,
          chunks: {
            id: true
          }
        }
      },
      relations: {
        embedding: {
          chunks: true
        }
      }
    });
  }

  async getDocumentById(id: string): Promise<Document | null> {
    return this.documentRepository.findOne({ where: { id } });
  }

  async createNewDocument(payload: {
    title: string;
    content?: string;
    fileName?: string;
    filePath?: string;
  }): Promise<Document> {
    const document = new Document();
    document.title = payload.title;
    document.content = payload.content;
    document.fileName = payload.fileName;
    document.filePath = payload.filePath;
    return this.documentRepository.save(document);
  }

  async saveDocument(document: Document): Promise<Document> {
    return this.documentRepository.save(document);
  }

  async deleteDocument(id: string): Promise<void> {
    await this.documentRepository.delete(id);
  }

  async updateDocumentTitle(id: string, payload: { title: string }): Promise<Document> {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new Error('Document not found');
    }
    document.title = payload.title;
    return this.documentRepository.save(document);
  }

  async updateDocumentContent(id: string, payload: { content: string }): Promise<Document> {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new Error('Document not found');
    }
    document.content = payload.content;
    return this.documentRepository.save(document);
  }
}
