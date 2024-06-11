import * as winston from 'winston'
import 'winston-daily-rotate-file'
import { getAppLogFilePath } from './path'

const { combine, timestamp, splat, json } = winston.format

const logFilePath = getAppLogFilePath()
let winstonInstance: winston.Logger | undefined = undefined

function loggerSingleton() {
  if (!winstonInstance) {
    winstonInstance = winston.createLogger({
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: logFilePath,
          maxsize: 1024 * 1024 * 20,
          maxFiles: 5
        })
      ],
      format: combine(
        timestamp({
          format: 'YYYY-MM-DD hh:mm:ss.SSS A'
        }),
        splat(),
        json()
      )
    })
  }
  return winstonInstance
}

export const logger = loggerSingleton()
