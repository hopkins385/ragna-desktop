import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Chat } from './chat.entity'
import type { Relation } from 'typeorm'

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  role: string

  @Column()
  content: string

  @JoinColumn({ name: 'chat_id' })
  @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: 'CASCADE' })
  chat: Relation<Chat>
}
