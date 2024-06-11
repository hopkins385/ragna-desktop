import {
  getLlama,
  Llama,
  LlamaChatSession,
  LlamaContext,
  LlamaEmbeddingContext,
  LlamaModel
} from 'node-llama-cpp'
import { getMainWindow } from '../utils/window'
import { logger } from './logger'

let llama: Llama | null = null
let model: LlamaModel | null = null
let context: LlamaContext | null = null
let embeddingContext: LlamaEmbeddingContext | null = null
// let contextSequence: LlamaContextSequence | null = null

let chatSession: LlamaChatSession | null = null
let abortController: AbortController | null = null

function modelIsLoaded(value: boolean) {
  const mainWindow = getMainWindow()
  mainWindow?.webContents.send('llm-model-loaded', value)
  sendLoadingProgress(value ? 100 : 0)
}

function sendLoadingProgress(progress: number) {
  const mainWindow = getMainWindow()
  mainWindow?.webContents.send('update-llm-loading-progress', progress)
}

export async function unloadLlama() {
  if (model == null) {
    return
  }

  try {
    chatSession?.dispose()
    await context?.dispose()
    await model.dispose()
    console.log('Model disposed', model.disposed)
    model = null
    modelIsLoaded(false)
  } catch (err) {
    logger.error('Failed to dispose model', err)
    return
  }
}

async function warumUpModel(model: LlamaModel, signal: AbortSignal) {
  // warm up the model with a dummy prompt
  const context = await model.createContext({
    createSignal: signal,
    contextSize: Math.min(4096, model.trainContextSize)
  })
  const chatSession = new LlamaChatSession({
    contextSequence: context.getSequence()
  })

  await chatSession.prompt('hello', {
    maxTokens: 1
  })
  chatSession.dispose()
  context.dispose()
}

export async function loadLlama(filePath: string) {
  abortController = new AbortController()
  const modelPath = filePath

  try {
    llama = await getLlama()
  } catch (err) {
    logger.error('Failed to get llama', err)
    modelIsLoaded(false)
    return
  }

  if (llama == null) {
    throw new Error('Llama is not loaded')
  }

  if (model != null) {
    console.log('Unloading previous model')
    await unloadLlama()
  }

  try {
    model = await llama.loadModel({
      loadSignal: abortController.signal,
      modelPath,
      // Force the system to keep the model in the RAM/VRAM
      useMlock: false,
      // Number of layers to store in VRAM
      gpuLayers: 'auto'
      /*onLoadProgress(loadProgress: number) {
        const progress = toInt(loadProgress) * 100
        if (progress > 90) return
        sendLoadingProgress(progress)
      }*/
    })

    await warumUpModel(model, abortController.signal)

    modelIsLoaded(true)

    llama.onDispose.createListener(() => {
      modelIsLoaded(false)
    })
  } catch (err) {
    logger.error('Failed to load model', err)
    modelIsLoaded(false)
    return
  }

  return model
}

export async function createContext(signal: AbortSignal) {
  if (model == null) {
    throw new Error('Model is not loaded')
  }

  context = await model.createContext({
    createSignal: signal,
    contextSize: Math.min(4096, model.trainContextSize)
  })

  return context
}

export async function createSession(systemPrompt: string | undefined) {
  if (model == null) {
    throw new Error('Model is not loaded')
  }

  abortController = new AbortController()

  context = await createContext(abortController.signal)

  chatSession = new LlamaChatSession({
    // autoDisposeSequence: true,
    contextSequence: context.getSequence(),
    systemPrompt
  })

  return chatSession
}

export function getChatSession() {
  if (chatSession == null) {
    throw new Error('Chat session is not created')
  }
  return { chatSession, model }
}

export function getModel() {
  if (model == null) {
    throw new Error('Model is not loaded')
  }
  return model
}

export async function getEmbeddingContext() {
  const model = getModel()

  if (!embeddingContext) {
    embeddingContext = await model.createEmbeddingContext({
      contextSize: 'auto'
    })
  }

  return embeddingContext
}
