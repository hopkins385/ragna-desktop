import type { ChatMessage } from '../database/entities';
import { ChatService } from './../services/chat.service';
import { ipcMain } from 'electron';
import { getMainWindow } from '../utils/window';
import { globalInferenceService } from '../services/inference.service';
import { ChatRepository } from '../repositories/chat.repository';
import { logger } from '../utils/logger';
import { getLlmContextSize, getLlmGpuLayers, getLlmUseMlock } from '../utils/llm-settings';

const inferenceService = globalInferenceService;

const chatService = new ChatService(ChatRepository);

interface InferencePayload {
  prompt: string;
  temperature: number;
  maxTokens: number;
  history?: ChatMessage[];
  context?: string;
}

async function runInference(payload: InferencePayload) {
  const mainWindow = getMainWindow();

  mainWindow.webContents.send('llm-is-streaming', true);

  const result = await inferenceService.runInference(payload, (text: string) => {
    mainWindow.webContents.send('new-llm-chunk', text);
  });

  mainWindow.webContents.send('llm-is-streaming', false);

  return result;
}

export function handleInferenceIPCs() {
  // Load LLM
  ipcMain.handle('load-llm', async (_, filePath) => {
    const gpuLayers = getLlmGpuLayers();
    const contextSize = getLlmContextSize();
    const useMlock = getLlmUseMlock();
    const result = await inferenceService.loadModel({
      modelPath: filePath,
      contextSize,
      gpuLayers,
      useMlock
    });
    // console.log('Load-LLM result: ', result);
    return { success: result };
  });

  // Abort LLM Loading
  ipcMain.handle('abort-load-llm', async () => {
    const result = await inferenceService.abortLoadModel();
    return { success: result };
  });

  // Unload LLM
  ipcMain.handle('unload-llm', async () => {
    const result = await inferenceService.unloadModel();
    return { success: result };
  });

  // Create LLM Session
  ipcMain.handle('create-llm-session', async (_, payload) => {
    const { systemPrompt } = payload;
    const result = await inferenceService.createSession(systemPrompt);
    const chat = await chatService.createNewChat({ title: 'New Chat' });
    // console.log('New chat created: ', chat);
    return chat;
  });

  // clear chat history
  ipcMain.handle('clear-llm-history', async (_, chatId) => {
    if (!chatId) {
      logger.error('[server] cannot clear chat histroy because chatId is not provided');
      return;
    }
    const res = await inferenceService.clearSessionHistory();
    if (!res) {
      logger.error('[server] Failed to clear chat history');
      return;
    }
    const chat = await chatService.deleteAllChatMessages(chatId);
    return chat;
  });

  // init history from chat
  ipcMain.handle(
    'init-llm-history-from-chat',
    async (_, payload: { chatId: string; systemPrompt: string }) => {
      if (!payload.chatId) {
        logger.error('[server] cannot init chat histroy because chatId is not provided');
        return;
      }
      const chat = await chatService.getChatById(payload.chatId);
      if (!chat) {
        logger.error('[server] Chat not found');
        return;
      }

      // add system prompt to chat
      const systemMessagePayload = {
        id: 'system-prompt',
        role: 'system',
        content: payload.systemPrompt
      } as ChatMessage;

      const res = await inferenceService.setSessionHistory([
        systemMessagePayload,
        ...chat.messages
      ]);
      if (!res) {
        logger.error('[server] Failed to init llm session history');
        return;
      }

      return chat;
    }
  );

  interface RequestLlmPayload {
    prompt: string;
    temperature: number;
    maxTokens: number;
    history?: any[];
    chatId?: string;
    context?: string;
  }

  // editor completion
  ipcMain.handle('completion', async (_, payload: RequestLlmPayload) => {
    const { prompt, temperature, maxTokens } = payload;
    const history = payload?.history || [];

    try {
      const response = await runInference({
        prompt,
        temperature,
        maxTokens,
        history
      });

      return response;
    } catch (error) {
      logger.error('Failed to run completion: %s', error);
      return null;
    }
  });

  // chat completion
  ipcMain.handle('chat-completion', async (_, payload: RequestLlmPayload) => {
    const { prompt, temperature, maxTokens } = payload;
    const chatId = payload?.chatId || '';
    const history = payload?.history || [];
    const context = payload?.context;

    const userMessagePayload = {
      role: 'user',
      content: prompt
    };

    // Add user message to chat
    try {
      const res = await chatService.createNewChatMessage(chatId, userMessagePayload);
    } catch (error) {
      logger.error('Failed to add user message to chat: %s', error);
    }

    // Run inference
    try {
      const assistantResponseMessage = await runInference({
        prompt,
        temperature,
        maxTokens,
        history,
        context
      });

      const assistantMessagePayload = {
        role: 'assistant',
        content: assistantResponseMessage || ''
      };

      // Add assistant message to chat
      const chat = await chatService.createNewChatMessage(chatId, assistantMessagePayload);
      // console.log('Chat updated: ', chat);
      //
      return assistantResponseMessage;
      //
    } catch (error) {
      logger.error('Failed to run chat-completion: %s', error);
      return null;
    }
  });

  // Stop LLM Streaming
  ipcMain.handle('stop-llm-streaming', () => {
    inferenceService.abortInference();
  });
}
