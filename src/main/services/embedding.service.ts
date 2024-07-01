import type { Connection } from 'vectordb';
import { InferenceService } from './inference.service';
import { MetricType } from 'vectordb';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { FileParserFactory } from '../factories/fileParserFactory';
import { DocumentService } from './document.service';

// import { Schema, Field, Float32, FixedSizeList, Int32, Float16 } from 'apache-arrow'

interface SimilaritySearchResult {
  content: string;
  distance: number;
}

interface FileContents {
  fileName: string;
  content: string;
}

async function getFileContents(filePath: string): Promise<FileContents> {
  const parts = filePath.split('/');
  const fileName = parts[parts.length - 1];
  const factory = new FileParserFactory(filePath);
  const content = await factory.loadData();
  return {
    fileName,
    content
  };
}

async function splitText(text: string) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  });
  const documents = await splitter.createDocuments([text]);
  return documents;
}

export class EmbeddingService {
  private readonly vectorDb: Connection;
  private readonly defaultTableName: string;
  private readonly inferenceService: InferenceService;
  private readonly documentService: DocumentService;

  constructor(
    vectorDb: Connection,
    inferenceService: InferenceService,
    documentService: DocumentService
  ) {
    if (!vectorDb) {
      throw new Error('Vector database connection not established');
    }
    if (!inferenceService) {
      throw new Error('Inference service not established');
    }

    this.vectorDb = vectorDb;
    this.inferenceService = inferenceService;
    this.documentService = documentService;
    this.defaultTableName = 'documents';
  }

  async getEmbeddingVector(text: string) {
    const result = await this.inferenceService.getVectorFor(text);
    return result.vector;
  }

  async similaritySearch(payload: {
    query: string;
    limit?: number;
  }): Promise<SimilaritySearchResult[]> {
    if (!this.inferenceService.modelIsLoaded()) {
      throw new Error('Model is not loaded');
    }

    const table = await this.vectorDb.openTable(this.defaultTableName);

    console.log('Searching query:', payload.query);

    const vector = await this.getEmbeddingVector(payload.query);

    console.log('Vector is:', vector);

    const dbQuery = table
      .search(vector)
      .metricType(MetricType.Cosine)
      .limit(payload.limit ?? 4);
    const results = await dbQuery.execute();

    const response = results.map((result: any) => {
      return {
        content: result?.content || '',
        distance: result?._distance || 0
      };
    });

    return response;
  }

  async createEmbeddingsForFile(payload: { filePath: string; fileName?: string; fileId?: string }) {
    if (!this.inferenceService.modelIsLoaded()) {
      throw new Error('Model is not loaded');
    }

    // Check if vector db exists
    const tableNames = await this.vectorDb.tableNames();
    if (tableNames.includes(this.defaultTableName)) {
      // delete all embeddings
      await this.deleteAllEmbeddings();
    }

    // Get file contents
    const { fileName, content: fileContent } = await getFileContents(payload.filePath);

    // Store file contents in database
    const documentEntity = await this.documentService.createNewDocument({
      title: fileName,
      content: fileContent,
      fileName: fileName,
      filePath: payload.filePath
    });

    if (!documentEntity) {
      throw new Error('Error creating document entity');
    }

    // split text into chunks
    const documents = await splitText(fileContent);

    // get embedding vector for each chunk
    const vectorDbData = [] as any;
    for (const document of documents) {
      const vector = await this.getEmbeddingVector(document.pageContent);
      vectorDbData.push({
        vector: vector,
        content: document.pageContent,
        metadata: document.metadata
      });
    }

    if (vectorDbData.length === 0) {
      return;
    }
    if (vectorDbData.length !== documents.length) {
      throw new Error(`vectorDbData and documents must have the same length`);
    }

    console.log('Inserting data into vector db');
    await this.createVectorDbTable(vectorDbData);

    return true;
  }

  async createVectorDbTable(data: any, tableName: string = this.defaultTableName) {
    const tableNames = await this.vectorDb.tableNames();
    if (!tableNames.includes(tableName)) {
      return this.vectorDb.createTable({ name: tableName, data });
    }

    const table = await this.vectorDb.openTable(tableName);
    return await table.add(data);
  }

  async deleteEmbeddingsOfFile(fileId: string) {
    throw new Error('Not implemented');
  }

  async deleteAllEmbeddings(tableName: string = this.defaultTableName) {
    const res1 = this.documentService.deleteAllDocuments();
    const res = this.vectorDb.dropTable(tableName);

    await Promise.all([res1, res]);

    console.log('Deleted all embeddings');

    return true;
  }
}
