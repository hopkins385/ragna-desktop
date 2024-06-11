import { ChatService } from './../services/chat.service'
import { ipcMain } from 'electron'
import { getMainWindow } from '../utils/window'
import { getAppStorage } from '../utils/store'
import { globalInferenceService } from '../services/inference.service'
import { ChatRepository } from '../repositories/chat.repository'
import { logger } from '../utils/logger'

const inferenceService = globalInferenceService

const chatService = new ChatService(ChatRepository)

interface InferencePayload {
  prompt: string
  temperature: number
  maxTokens: number
}

async function runInference(payload: InferencePayload) {
  const mainWindow = getMainWindow()

  mainWindow.webContents.send('llm-is-streaming', true)

  const result = await inferenceService.runInference(payload, (text: string) => {
    mainWindow.webContents.send('new-llm-chunk', text)
  })

  mainWindow.webContents.send('llm-is-streaming', false)

  return result
}

export function handleInferenceIPCs() {
  // Load LLM
  ipcMain.handle('load-llm', async (_, filePath) => {
    const store = getAppStorage()
    const gpuLayers = store.get('gpu_layers', -1) as number
    const result = await inferenceService.loadModel({
      modelPath: filePath,
      gpuLayers
    })
    return { success: result }
  })

  // Unload LLM
  ipcMain.handle('unload-llm', async () => {
    const result = await inferenceService.unloadModel()
    return { success: result }
  })

  // Create LLM Session
  ipcMain.handle('create-llm-session', async (_, payload) => {
    const { systemPrompt } = payload
    const result = await inferenceService.createSession(systemPrompt)
    const chat = await chatService.createNewChat({ title: 'New Chat' })
    console.log('New chat created: ', chat)
    return chat
  })

  // clear chat history
  ipcMain.handle('clear-llm-history', async (_, chatId) => {
    if (!chatId) {
      logger.error('[server] cannot clear chat histroy because chatId is not provided')
      return
    }
    const res = await inferenceService.clearSessionHistory()
    if (!res) {
      logger.error('[server] Failed to clear chat history')
      return
    }
    const chat = await chatService.deleteAllChatMessages(chatId)
    return chat
  })

  // init history from chat
  ipcMain.handle('init-llm-history-from-chat', async (_, chatId) => {
    if (!chatId) {
      logger.error('[server] cannot init chat histroy because chatId is not provided')
      return
    }
    const chat = await chatService.getChatById(chatId)
    if (!chat) {
      logger.error('[server] Chat not found')
      return
    }

    const res = await inferenceService.setSessionHistory(chat.messages)
    if (!res) {
      logger.error('[server] Failed to init llm session history')
      return
    }

    return chat
  })

  // Request LLM
  ipcMain.handle('request-llm', async (_, payload: any) => {
    const { prompt, temperature, maxTokens } = payload
    const chatId = payload?.chatId || ''

    const userMessagePayload = {
      role: 'user',
      content: prompt
    }

    // Add user message to chat
    try {
      const res = await chatService.createNewChatMessage(chatId, userMessagePayload)
    } catch (error) {
      logger.error(error)
    }

    // Run inference
    try {
      const assistantResponseMessage = await runInference({
        prompt,
        temperature,
        maxTokens
      })

      const assistantMessagePayload = {
        role: 'assistant',
        content: assistantResponseMessage || ''
      }

      // Add assistant message to chat
      const chat = await chatService.createNewChatMessage(chatId, assistantMessagePayload)
      console.log('Chat updated: ', chat)
      //
      return assistantResponseMessage
      //
    } catch (error) {
      logger.error(error)
      return null
    }
  })

  // Stop LLM Streaming
  ipcMain.handle('stop-llm-streaming', () => {
    inferenceService.abortInference()
  })
}
