import { readFileSync } from 'node:fs'
import { extractRawText } from 'mammoth'

export class DocxParser {
  async loadData(filePath: string): Promise<string> {
    const dataBuffer = readFileSync(filePath)
    const { value } = await extractRawText({ buffer: dataBuffer })
    return value
  }
}
