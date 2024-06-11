import { globalDatabaseConn } from '../database/connection'
import { User } from '../database/entities/user.entity'

export const UserRepository = globalDatabaseConn.getRepository(User)
