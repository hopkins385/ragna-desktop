import type { IChatMessage } from '@renderer/interfaces/chat.interface'
import { defineStore } from 'pinia'

interface IChatSettings {
  showEditSystemPrompt: boolean
  systemPrompt: string
  systemPromptHasChanged: boolean
  temperature: [number]
  presencePenalty: [number]
  maxTokens: [number]
}

export const useChatSettingsStore = defineStore('chat-settings', {
  state: (): IChatSettings => ({
    showEditSystemPrompt: false,
    systemPrompt: '',
    systemPromptHasChanged: false,
    temperature: [80],
    presencePenalty: [0],
    maxTokens: [2048]
  }),
  getters: {
    getTemperature(state) {
      return state.temperature[0] / 100
    },
    getPresencePenalty(state) {
      return state.presencePenalty[0] / 100
    },
    getMaxTokens(state) {
      return state.maxTokens[0]
    },
    getSystemPrompt(state) {
      return state.systemPrompt
    },
    getFormattedSystemPrompt(state): IChatMessage[] {
      if (state.systemPrompt === '') return []
      return [
        {
          id: -99,
          role: 'system',
          content: state.systemPrompt
        }
      ]
    },
    getShowEditSystemPrompt(state) {
      return state.showEditSystemPrompt
    }
  },
  actions: {
    setTemperature(temperature: [number]) {
      this.temperature = temperature
    },
    setPresencePenalty(presencePenalty: [number]) {
      this.presencePenalty = presencePenalty
    },
    setMaxTokens(maxTokens: [number]) {
      this.maxTokens = maxTokens
    },
    setSystemPrompt(systemPrompt: string) {
      this.systemPrompt = systemPrompt
    },
    setSystemPromptHasChanged(systemPromptHasChanged: boolean) {
      this.systemPromptHasChanged = systemPromptHasChanged
      // wait for 500ms before setting it back to false
      setTimeout(() => {
        this.systemPromptHasChanged = false
      }, 500)
    },
    setShowEditSystemPrompt(showEditSystemPrompt: boolean) {
      this.showEditSystemPrompt = showEditSystemPrompt
    },
    resetSettings() {
      this.temperature = [80]
      this.presencePenalty = [0]
      this.maxTokens = [2048]
      // this.systemPrompt = ''
      this.showEditSystemPrompt = false
    }
  },
  persist: true
})
