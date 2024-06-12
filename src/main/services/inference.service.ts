import type { ChatMessage } from '../database/entities';
import {
  ChatHistoryItem,
  type ChatUserMessage,
  type ChatModelResponse,
  type ChatSystemMessage,
  getLlama,
  Llama,
  LlamaChatSession,
  LlamaContext,
  LlamaEmbeddingContext,
  LlamaLogLevel,
  LlamaModel
} from 'node-llama-cpp';
import { is } from '@electron-toolkit/utils';
import { logger } from '../utils/logger';

export class InferenceService {
  private abortController: AbortController;
  private inferenceAbortController: AbortController;
  private model: LlamaModel | null;
  private llama: Llama;
  private modelState: 'loading' | 'loaded' | 'unloaded';
  private chatSession: LlamaChatSession | null;
  private context: LlamaContext | null;
  private embeddingContext: LlamaEmbeddingContext;

  constructor(llamaBinding: Llama) {
    if (!llamaBinding) throw new Error('Llama binding required');
    this.llama = llamaBinding;
    // Default model state is unloaded
    this.modelState = 'unloaded';
  }

  static async init() {
    try {
      const binding = await getLlama({
        logLevel: is.dev ? LlamaLogLevel.warn : LlamaLogLevel.error,
        logger(level, message) {
          // logger.log(level, message);
          console.log(level, message);
        },
        build: 'never'
      });
      console.log('Llama binding initialized');
      return new InferenceService(binding);
      //
    } catch (err) {
      logger.error('Failed to initialize Llama binding: %s', err);
      throw new Error('Failed to initialize Llama binding');
    }
  }

  modelIsLoaded() {
    return this.modelState === 'loaded';
  }

  async warumUpModel() {
    if (!this.model || this.modelState !== 'loaded') {
      throw new Error('Model is not loaded');
    }
    // warm up the model with a dummy prompt
    const context = await this.model.createContext({
      createSignal: this.abortController.signal,
      contextSize: Math.min(4096, this.model.trainContextSize)
    });
    const chatSession = new LlamaChatSession({
      contextSequence: context.getSequence()
    });

    await chatSession.prompt('hello', {
      maxTokens: 1
    });
    chatSession.dispose();
    context.dispose();
  }

  setModelLoadingState(state: 'loading' | 'loaded' | 'unloaded') {
    this.modelState = state;
  }

  async loadModel(payload: { modelPath: string; gpuLayers?: number; useMlock?: boolean }) {
    this.abortController = new AbortController();

    if (this.modelState === 'loaded') {
      console.log('Unloading previous model');
      await this.unloadModel();
    }

    let gpuLayers: 'auto' | number = 'auto';

    switch (payload.gpuLayers) {
      case 0:
        gpuLayers = 0;
        break;
      case -1:
        gpuLayers = 'auto';
        break;
      default:
        gpuLayers = 'auto';
    }

    this.setModelLoadingState('loading');

    console.log('Loading model', {
      path: payload.modelPath,
      gpuLayers,
      useMlock: payload.useMlock
    });

    try {
      this.model = await this.llama.loadModel({
        loadSignal: this.abortController.signal,
        modelPath: payload.modelPath.toString(),
        // Force the system to keep the model in the RAM/VRAM
        useMlock: payload.useMlock || false,
        // Number of layers to store in VRAM
        gpuLayers
      });
      this.setModelLoadingState('loaded');

      await this.warumUpModel();
      this.context = await this.createContext();

      this.llama.onDispose.createListener(() => {
        this.setModelLoadingState('unloaded');
      });
    } catch (err) {
      logger.error('Failed to load model %s', err);
      this.setModelLoadingState('unloaded');
      return false;
    }

    return true;
  }

  async unloadModel() {
    if (!this.model || this.modelState !== 'loaded') {
      return true;
    }

    try {
      if (this.chatSession) {
        this.chatSession.dispose();
        this.chatSession = null;
      }
      if (this.context) {
        await this.context.dispose();
        this.context = null;
      }
      await this.model.dispose();
      this.model = null;
      this.setModelLoadingState('unloaded');
    } catch (err) {
      logger.error('Failed to dispose model %s', err);
      return false;
    }

    return true;
  }

  async createContext() {
    if (!this.model || this.modelState !== 'loaded') {
      throw new Error('Model is not loaded');
    }

    const context = await this.model.createContext({
      createSignal: this.abortController.signal,
      contextSize: Math.min(4096, this.model.trainContextSize)
    });

    return context;
  }

  async createSession(systemPrompt: string | undefined) {
    if (this.modelState !== 'loaded') {
      throw new Error('Model is not loaded');
    }

    if (!this.context) {
      throw new Error('Context is not created');
    }

    if (this.chatSession) {
      this.chatSession.dispose();
      this.chatSession = null;
    }

    this.chatSession = new LlamaChatSession({
      // autoDisposeSequence: true,
      contextSequence: this.context.getSequence(),
      systemPrompt
    });

    return true;
  }

  async clearSessionHistory() {
    if (!this.chatSession) return;

    this.chatSession.setChatHistory([]);

    return true;
  }

  async setSessionHistory(chatMessages: ChatMessage[]) {
    if (!this.chatSession) return;

    const chatHistoryItems: ChatHistoryItem[] = chatMessages.map((message) => {
      switch (message.role) {
        case 'system':
          return {
            type: 'system',
            text: message.content
          } as ChatSystemMessage;
        case 'assistant':
          return {
            type: 'model',
            response: Array.isArray(message.content) ? message.content : [message.content]
          } as ChatModelResponse;
        case 'user':
          return {
            type: 'user',
            text: message.content
          } as ChatUserMessage;
        default:
          throw new Error('Invalid message role');
      }
    });

    this.chatSession.setChatHistory(chatHistoryItems);

    console.log('Chat history set', chatHistoryItems);

    return true;
  }

  async runInference(
    payload: { prompt: string; temperature: number; maxTokens: number; history?: ChatMessage[] },
    newChunkCallback: (text: string) => void
  ) {
    if (!this.model || this.modelState !== 'loaded') {
      throw new Error('Model is not loaded');
    }
    if (!this.chatSession) {
      throw new Error('Chat session is not created');
    }

    this.inferenceAbortController = new AbortController();

    if (payload.history && payload.history.length > 0) {
      await this.setSessionHistory(payload.history);
    }

    try {
      return await this.chatSession.prompt(payload.prompt, {
        signal: this.inferenceAbortController.signal,
        stopOnAbortSignal: true,
        temperature: payload.temperature,
        maxTokens: payload.maxTokens,
        onToken: (chunk) => {
          if (!this.model) {
            this.inferenceAbortController.abort();
            return;
          }
          const text = this.model.detokenize(chunk);
          newChunkCallback(text);
        }
      });
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        if (is.dev) console.log('Inference aborted');
        return;
      }
      logger.error('Failed to run inference %s', err);
      throw new Error('Failed to run inference');
    }
  }

  abortInference() {
    if (this.inferenceAbortController) {
      this.inferenceAbortController.abort();
    }
  }

  async createEmbeddingContext() {
    if (!this.model || this.modelState !== 'loaded') {
      throw new Error('Model is not loaded');
    }

    return await this.model.createEmbeddingContext({
      contextSize: 'auto'
    });
  }

  async getVectorFor(text: string) {
    if (!this.embeddingContext) {
      this.embeddingContext = await this.createEmbeddingContext();
    }

    return await this.embeddingContext.getEmbeddingFor(text);
  }
}

let inferenceService: InferenceService;

async function inferenceServiceSingleton() {
  if (!inferenceService) {
    inferenceService = await InferenceService.init();
  }
  return inferenceService;
}

export const globalInferenceService = await inferenceServiceSingleton();
