import type { Repository } from 'typeorm';
import type { Connection } from 'vectordb';
import { InferenceService } from './inference.service';
import { MetricType } from 'vectordb';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { FileParserFactory } from '../factories/fileParserFactory';
import { DocumentService } from './document.service';
import { Embedding, EmbeddingChunk } from '../database/entities';

// import { Schema, Field, Float32, FixedSizeList, Int32, Float16 } from 'apache-arrow'

export class EmbeddingService {
  private readonly vectorDb: Connection;
  private readonly defaultTableName: string;
  private readonly embeddingRepository: Repository<Embedding>;
  private readonly inferenceService: InferenceService;
  private readonly documentService: DocumentService;

  constructor(
    vectorDb: Connection,
    embeddingRepository: Repository<Embedding>,
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
    this.embeddingRepository = embeddingRepository;
    this.inferenceService = inferenceService;
    this.documentService = documentService;
    this.defaultTableName = 'documents';
  }

  async getEmbeddingVector(text: string) {
    const result = await this.inferenceService.getVectorFor(text);
    return result.vector;
  }

  async createNewTable(name: string) {
    //
    throw new Error('Not implemented');
  }

  async insertData(data: any, tableName: string = this.defaultTableName) {
    const tableNames = await this.vectorDb.tableNames();
    if (!tableNames.includes(tableName)) {
      return this.vectorDb.createTable({ name: tableName, data });
    }

    const table = await this.vectorDb.openTable(tableName);
    return await table.add(data);
  }

  async search(queryInput: string, tableName: string = this.defaultTableName) {
    const table = await this.vectorDb.openTable(tableName);

    const vector = await this.getEmbeddingVector(queryInput);

    const dbQuery = table.search(vector).metricType(MetricType.Cosine).limit(2);
    const results = await dbQuery.execute();

    const response = results.map((result: any) => {
      return {
        content: result?.content || '',
        distance: result?._distance || 0
      };
    });

    return response;
  }

  async getFileContents(filePath: string): Promise<any> {
    const parts = filePath.split('/');
    const fileName = parts[parts.length - 1];
    const factory = new FileParserFactory(filePath);
    const content = await factory.loadData();
    return {
      fileName,
      content
    };
  }

  async splitText(text: string) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    });
    const documents = await splitter.createDocuments([text]);
    return documents;
  }

  async embedFile(path: string) {
    if (!this.inferenceService.modelIsLoaded()) {
      throw new Error('Model is not loaded');
    }

    const { fileName, content: fileContent } = await this.getFileContents(path);

    const documentEntity = await this.documentService.createNewDocument({
      title: fileName,
      content: fileContent,
      fileName: fileName,
      filePath: path
    });

    // create embedding Entity
    const newEmbeddingEntity = new Embedding();
    newEmbeddingEntity.title = fileName;
    newEmbeddingEntity.document = documentEntity;
    const embeddingEntity = await this.embeddingRepository.save(newEmbeddingEntity);
    // get the embedding entity with relation chunks
    const embeddingEntityWithChunks = await this.embeddingRepository.findOne({
      where: { id: embeddingEntity.id },
      relations: { chunks: true }
    });
    if (!embeddingEntityWithChunks) {
      throw new Error('Embedding entity not found');
    }

    // split text into chunks
    const documents = await this.splitText(fileContent);

    // get embedding vector for each chunk
    const vectorDbData = [] as any;
    for (const document of documents) {
      const vector = await this.getEmbeddingVector(document.pageContent);
      vectorDbData.push({
        vector: vector,
        content: document.pageContent,
        metadata: document.metadata // TODO: add  embeddingId: embeddingEntity.id
      });

      const embeddingChunk = new EmbeddingChunk();
      embeddingChunk.embedding = embeddingEntity;
      embeddingChunk.content = document.pageContent;
      embeddingEntityWithChunks.chunks.push(embeddingChunk);
    }

    if (vectorDbData.length === 0) {
      return;
    }
    if (vectorDbData.length !== documents.length) {
      throw new Error(`vectorDbData and documents must have the same length`);
    }

    console.log('Inserting data into vector db');
    await this.insertData(vectorDbData);

    console.log('Inserting data into embedding chunk entity');
    await this.embeddingRepository.save(embeddingEntityWithChunks);

    return true;
  }

  deleteAllEmbeddings(tableName: string = this.defaultTableName) {
    return this.vectorDb.dropTable(tableName);
  }
}
