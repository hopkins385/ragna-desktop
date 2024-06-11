import type { Relation } from 'typeorm';
import { Column, Entity, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Embedding } from './embedding.entity';

@Entity()
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ name: 'file_name', nullable: true })
  fileName?: string;

  @Column({ name: 'file_size', nullable: true })
  fileSize?: number;

  @Column({ name: 'file_type', nullable: true })
  fileType?: string;

  @Column({ name: 'file_path', nullable: true })
  filePath?: string;

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;

  @OneToOne(() => Embedding, (embedding) => embedding.document, {
    cascade: true,
    nullable: true
  })
  embedding: Relation<Embedding>;
}
