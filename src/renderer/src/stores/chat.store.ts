import { defineStore } from 'pinia'
import { useChatSettingsStore } from './chat-settings.store'
import type { IChatMessage } from '@renderer/interfaces/chat.interface'

interface IChatStore {
  id: string
  messages: IChatMessage[]
}

export const useChatStore = defineStore('chat', {
  state: (): IChatStore => ({
    id: '',
    messages: []
  }),
  getters: {
    getChatId(state) {
      return state.id
    },
    getMessages(state) {
      return state.messages
    },
    getFormattedMessages(state) {
      const settings = useChatSettingsStore()
      let messages = [] as IChatMessage[]
      // get the system prompt from the chat settings store
      // merge the system prompt with the messages
      if (settings.getFormattedSystemPrompt.length > 0) {
        messages = [...settings.getFormattedSystemPrompt, ...state.messages]
      } else {
        messages = [...state.messages]
      }
      // remove id from the messages
      return messages.map((message) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = message
        return rest
      })
    },
    hasMessages(state) {
      return state.messages.length > 0
    }
  },
  actions: {
    setChatId(chatId: string) {
      this.id = chatId
    },
    setMessages(messages: IChatMessage[]) {
      this.messages = messages
    },
    addMessage(content: string, role: 'user' | 'assistant') {
      this.messages.push({
        id: this.messages.length + 1,
        content,
        role
      })
    },
    updateMessage(id: number, content: string) {
      const message = this.messages.find((message) => message.id === id)
      if (message) {
        message.content = content
      }
    },
    deleteMessage(id: number) {
      this.messages = this.messages.filter((message) => message.id !== id)
    },
    deleteAllMessagesAfter(id: number) {
      this.messages = this.messages.filter((message) => message.id <= id)
    },
    clearMessages() {
      this.messages = []
    }
  }
})
