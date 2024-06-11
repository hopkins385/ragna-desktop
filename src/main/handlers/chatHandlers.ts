import { ipcMain } from 'electron';
import { ChatRepository } from '../repositories/chat.repository';
import { ChatService } from '../services/chat.service';

const chatService = new ChatService(ChatRepository);

export function handleChatIPCs() {
  ipcMain.handle('get-all-chats', async () => {
    const chats = await chatService.getAllChatsPaginated();
    return chats;
  });

  ipcMain.handle('get-chat-by-id', async (_, chatId: string) => {
    const chat = await chatService.getChatById(chatId);
    return chat;
  });

  ipcMain.handle('create-chat', async (_, chatData) => {
    // const chat = await chatService.createChat(chatData)
    // return chat
    throw new Error('Not implemented');
  });

  ipcMain.handle('update-chat', async (_, chatData) => {
    // const chat = await chatService.updateChat(chatData)
    // return chat
    throw new Error('Not implemented');
  });

  ipcMain.handle('delete-chat', async (_, chatId: string) => {
    return await chatService.deleteChat(chatId);
  });
}
