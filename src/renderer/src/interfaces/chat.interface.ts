export interface IChatMessage {
  id: number
  role: 'user' | 'assistant' | 'system'
  content: string
}
