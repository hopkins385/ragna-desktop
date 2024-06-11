import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { ChatMessage } from './chat-message.entity'
import type { Relation } from 'typeorm'

@Entity()
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  title: string

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt?: Date

  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.chat, {
    cascade: true,
    nullable: true
  })
  messages: Relation<ChatMessage[]>
}
