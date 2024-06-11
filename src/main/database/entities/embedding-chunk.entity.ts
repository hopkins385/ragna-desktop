import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Embedding } from './embedding.entity';
import type { Relation } from 'typeorm';

@Entity()
export class EmbeddingChunk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @JoinColumn({ name: 'embedding_id' })
  @ManyToOne(() => Embedding, (embedding) => embedding.chunks, { onDelete: 'CASCADE' })
  embedding: Relation<Embedding>;
}
