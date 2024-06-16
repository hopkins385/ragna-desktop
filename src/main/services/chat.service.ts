import { ChatMessage } from '../database/entities/chat-message.entity';
import { Chat } from '../database/entities/chat.entity';
import { Like, type Repository } from 'typeorm';

export class ChatService {
  constructor(private chatRepository: Repository<Chat>) {}

  async getChatById(id: string): Promise<Chat | null> {
    return this.chatRepository.findOne({
      where: { id },
      relations: { messages: true }
    });
  }

  paginateResult<T>(data: T[], page: number, limit: number) {
    const [result, total] = data;
    const lastPage = Math.ceil(total / limit);
    const nextPage = page + 1 > lastPage ? null : page + 1;
    const prevPage = page - 1 < 1 ? null : page - 1;
    return {
      data: [...result],
      count: total,
      currentPage: page,
      nextPage: nextPage,
      prevPage: prevPage,
      lastPage: lastPage
    };
  }

  async getAllChats() {
    return this.chatRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async getAllChatsPaginated(payload: { search: string; page: number; limit: number }) {
    const take = payload.limit || 10;
    const page = payload.page || 1;
    const skip = (page - 1) * take;
    const keyword = payload.search || '';

    const data = await this.chatRepository.findAndCount({
      where: { title: Like('%' + keyword + '%') },
      order: { createdAt: 'DESC' },
      take: take,
      skip: skip
    });

    return this.paginateResult(data, page, take);
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
