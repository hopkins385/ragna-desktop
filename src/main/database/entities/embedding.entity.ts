import type { Relation } from 'typeorm';
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EmbeddingChunk } from './embedding-chunk.entity';
import { Document } from './document.entity';

@Entity()
export class Embedding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;

  // an embedding needs! to be associated with a document and is child of a document
  @JoinColumn({ name: 'document_id' })
  @OneToOne(() => Document, (document) => document.embedding, { onDelete: 'CASCADE' })
  document: Relation<Document>;

  // an embedding can have multiple embedding chunks and is parent of an embedding chunk
  @OneToMany(() => EmbeddingChunk, (embeddingChunk) => embeddingChunk.embedding, {
    cascade: true,
    nullable: true
  })
  chunks: Relation<EmbeddingChunk[]>;
}
