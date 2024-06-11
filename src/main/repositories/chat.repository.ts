import { globalDatabaseConn } from '../database/connection'
import { Chat } from '../database/entities/chat.entity'

export const ChatRepository = globalDatabaseConn.getRepository(Chat)
