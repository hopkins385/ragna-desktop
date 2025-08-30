import type { Connection } from '@lancedb/lancedb';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { FileParserFactory } from '../factories/fileParserFactory';
import { DocumentService } from './document.service';
import { PipelineSingleton } from './transformer.service';
import { is } from '@electron-toolkit/utils';
import { EmbeddingFunction } from '@lancedb/lancedb/embedding';
// import { Schema, Field, Float32, FixedSizeList, Int32, Float16 } from 'apache-arrow'

interface SimilaritySearchResult {
  content: string;
  distance: number;
}

interface FileContents {
  fileName: string;
  content: string;
}

const embedFn = {} as EmbeddingFunction<any>;
async function getEmbedFunction() {
  if (embedFn.sourceColumn) {
    return embedFn;
  }
  const pipe = await PipelineSingleton.getInstance(); // (p) => console.log('Progress: ', p)

  embedFn.sourceColumn = 'content';
  embedFn.embed = async function (batch: string[]) {
    const result: any[] = [];
    // Given a batch of strings, we will use the `pipe` function to get
    // the vector embedding of each string.
    for (const text of batch) {
      // 'mean' pooling and normalizing allows the embeddings to share the same length.
      const res = await pipe(text, { pooling: 'mean', normalize: true });
      result.push(Array.from(res['data']));
    }
    return result;
  };

  return embedFn;
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
    chunkSize: 500,
    chunkOverlap: 100
  });
  const documents = await splitter.createDocuments([text]);
  return documents;
}

export class EmbeddingService {
  private readonly vectorDb: Connection;
  private readonly defaultTableName: string;
  private readonly documentService: DocumentService;

  constructor(vectorDb: Connection, documentService: DocumentService) {
    if (!vectorDb) {
      throw new Error('Vector database connection not established');
    }

    this.vectorDb = vectorDb;
    this.documentService = documentService;
    // this.transformerService = transformerService;
    this.defaultTableName = 'documents';
  }

  async similaritySearch(payload: {
    query: string;
    limit?: number;
  }): Promise<SimilaritySearchResult[]> {
    const embeddingFn = await getEmbedFunction();
    const table = await this.vectorDb.openTable(this.defaultTableName, embeddingFn);

    const dbQuery = table.search(payload.query).limit(payload.limit ?? 2);

    const results = await dbQuery.toArray();

    if (!results) {
      return [];
    }

    const response = results.map((result: any) => {
      return {
        content: result?.content || '',
        distance: result?._distance || 0
      };
    });

    // filter out empty content and distance < 0.8
    const filteredResponse = response.filter((result) => result.content && result.distance < 0.8);
    // debug
    if (is.dev) {
      console.log('Filtered search results:', filteredResponse);
    }

    return filteredResponse;
  }

  async createEmbeddingsForFile(payload: { filePath: string; fileName?: string; fileId?: string }) {
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

    // prepare data for vector db
    const vectorDbData = [] as any;
    for (const document of documents) {
      vectorDbData.push({
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
    // debug
    if (is.dev) {
      console.log('Inserting data into vector db');
    }

    await this.createVectorDbTable(vectorDbData);

    return true;
  }

  async createVectorDbTable(data: any, tableName: string = this.defaultTableName) {
    const embeddingFn = await getEmbedFunction();
    const tableNames = await this.vectorDb.tableNames();
    if (!tableNames.includes(tableName)) {
      return this.vectorDb.createTable({
        name: tableName,
        data,
        embeddingFunction: embeddingFn
      });
    }

    const table = await this.vectorDb.openTable(tableName);
    return await table.add(data);
  }

  async deleteEmbeddingsOfFile(fileId: string) {
    throw new Error('Not implemented');
  }

  async deleteAllEmbeddings(tableName: string = this.defaultTableName) {
    const delAllDocs = this.documentService.deleteAllDocuments();
    const dropVdbTable = this.vectorDb.dropTable(tableName);

    await Promise.all([delAllDocs, dropVdbTable]);
    // debug
    if (is.dev) {
      console.log('Deleted all embeddings');
    }

    return true;
  }
}
