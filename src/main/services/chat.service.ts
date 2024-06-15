import { ChatMessage } from '../database/entities/chat-message.entity';
import { Chat } from '../database/entities/chat.entity';
import type { Repository } from 'typeorm';

export class ChatService {
  constructor(private chatRepository: Repository<Chat>) {}

  async getChatById(id: string): Promise<Chat | null> {
    return this.chatRepository.findOne({
      where: { id },
      relations: { messages: true }
    });
  }

  async getAllChatsPaginated(): Promise<Chat[]> {
    return this.chatRepository.find({ order: { createdAt: 'DESC' } });
  }

  async createNewChat(payload: { title: string }): Promise<Chat> {
    const chat = new Chat();
    chat.title = payload.title;
    return this.chatRepository.save(chat);
  }

  async createNewChatMessage(
    chatId: string,
    payload: { role: string; content: string }
  ): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: { messages: true }
    });
    if (!chat) {
      throw new Error('Chat not found');
    }

    const chatMessage = new ChatMessage();
    chatMessage.role = payload.role;
    chatMessage.content = payload.content;
    chat.messages.push(chatMessage);

    return this.chatRepository.save(chat);
  }

  async deleteAllChatMessages(chatId: string): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: { messages: true }
    });
    if (!chat) {
      throw new Error('Chat not found');
    }

    chat.messages = [];

    return this.chatRepository.save(chat);
  }

  async saveChat(chat: Chat): Promise<Chat> {
    return this.chatRepository.save(chat);
  }

  async deleteChat(id: string): Promise<void> {
    await this.chatRepository.delete(id);
  }
}
