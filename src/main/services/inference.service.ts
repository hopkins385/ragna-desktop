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
  private abortLoadModelController: AbortController;
  private inferenceAbortController: AbortController;
  private model: LlamaModel | null;
  private llama: Llama;
  private modelState: 'loading' | 'loaded' | 'unloaded';
  private chatSession: LlamaChatSession | null;
  private context: LlamaContext | null;
  private embeddingContext: LlamaEmbeddingContext | null;
  private contextSize: number;

  constructor(llamaBinding: Llama) {
    if (!llamaBinding) throw new Error('Llama binding required');
    this.llama = llamaBinding;
    // Default model states
    this.modelState = 'unloaded';
    this.model = null;
    this.chatSession = null;
    this.context = null;
    this.embeddingContext = null;
    this.contextSize = 2048;
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

  getModel() {
    return this.model;
  }

  getContextSize() {
    return this.contextSize;
  }

  setContextSize(size: number) {
    this.contextSize = size;
  }

  async warumUpModel(signal: AbortSignal) {
    if (!this.model || this.modelState !== 'loaded') {
      throw new Error('Model is not loaded');
    }

    const contextSize = this.getContextSize();

    try {
      // warm up the model with a dummy prompt
      const context = await this.model.createContext({
        createSignal: signal,
        contextSize: Math.min(contextSize, this.model.trainContextSize)
      });
      const chatSession = new LlamaChatSession({
        contextSequence: context.getSequence()
      });

      if (!context) {
        throw new Error('Failed to create warmup context');
      }

      if (!chatSession) {
        throw new Error('Failed to create warmup chat session');
      }

      await chatSession.prompt('hello', {
        maxTokens: 1
      });
      chatSession.dispose();
      context.dispose();
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        console.log('Warmup aborted');
        return;
      }
      logger.error('Failed to warm up model %s', err);
      throw new Error('Failed to warm up model');
    }
  }

  setModelLoadingState(state: 'loading' | 'loaded' | 'unloaded') {
    this.modelState = state;
  }

  async loadModel(payload: {
    modelPath: string;
    contextSize?: number;
    gpuLayers?: number;
    useMlock?: boolean;
  }) {
    this.abortLoadModelController = new AbortController();

    if (this.modelState === 'loaded') {
      console.log('Unloading previous model');
      await this.unloadModel();
    }

    if (payload.contextSize !== undefined && payload.contextSize > 0) {
      this.setContextSize(payload.contextSize);
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
      contextSize: this.getContextSize(),
      useMlock: payload.useMlock
    });

    try {
      const model = await this.llama.loadModel({
        loadSignal: this.abortLoadModelController.signal,
        modelPath: payload.modelPath.toString(),
        // Mlock forces the system to keep the model in the RAM/VRAM
        useMlock: payload.useMlock || false,
        // Number of layers to store in VRAM
        gpuLayers
      });
      if (!model) {
        throw new Error('Failed to load model');
      }
      this.model = model;
      this.setModelLoadingState('loaded');
      // this.model.onDispose.createListener(() => {
      //   this.setModelLoadingState('unloaded');
      // });
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        console.log('Model loading aborted');
        return false;
      }
      logger.error('Failed to load model %s', err);
      this.setModelLoadingState('unloaded');
      return false;
    }

    try {
      await this.warumUpModel(this.abortLoadModelController.signal);
    } catch (err: any) {
      logger.error('Failed to warm up model %s', err);
      return false;
    }

    try {
      const context = await this.createContext(this.abortLoadModelController.signal);
      if (!context) {
        return false;
      }
      this.context = context;
    } catch (err: any) {
      logger.error('Failed to create context %s', err);
      return false;
    }

    return true;
  }

  async abortLoadModel() {
    if (this.modelState === 'unloaded') {
      return true;
    }
    if (this.abortLoadModelController) {
      this.abortLoadModelController.abort();
    }
    // if (this.modelState === 'loaded') {
    //   await this.unloadModel();
    // }
    // this.setModelLoadingState('unloaded');
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

  async createContext(signal: AbortSignal) {
    if (!this.model || this.modelState !== 'loaded') {
      throw new Error('Model is not loaded');
    }

    const contextSize = this.getContextSize();

    try {
      const context = await this.model.createContext({
        createSignal: signal,
        contextSize: Math.min(contextSize, this.model.trainContextSize)
      });

      return context;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        console.log('Context creation aborted');
        return;
      }
      logger.error('Failed to create context %s', err);
      throw new Error('Failed to create context');
    }
  }

  async createSession(systemPrompt: string | undefined) {
    if (!this.model || this.modelState !== 'loaded') {
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
