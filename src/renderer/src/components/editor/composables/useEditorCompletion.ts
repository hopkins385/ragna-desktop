import { ref } from 'vue'
import axios from 'axios'

export interface EditorCompletionPayload {
  lang: string
  action: string
  selectedText: string
  fullText: string
  prompt: string
}

export default function useEditorCompletion() {
  const isLoading = ref(false)
  const ac = new AbortController()

  function getMessages(payload: EditorCompletionPayload) {
    const systemMessage = {
      role: 'system',
      content:
        'You are a friendly and helpful assistant. Your task is to help the user. You only respond with the text and do not explain your suggestions.'
    }
    const userMessage = {
      role: 'user',
      content: `Please ${payload.action} the following text: ${payload.selectedText}`
    }
    return [systemMessage, userMessage]
  }

  async function getEditorCompletion(payload: EditorCompletionPayload) {
    isLoading.value = true

    const messages = getMessages(payload)

    console.log('[EditorCompletion Messages] ', messages)

    const response = await axios.post('http://localhost:8093/v1/chat/completions', {
      messages,
      max_tokens: payload.selectedText.length + 300
    })
    isLoading.value = false
    return response.data
  }

  return {
    isLoading,
    getEditorCompletion
  }
}
