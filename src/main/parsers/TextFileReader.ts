import { readFile } from 'fs/promises'

export class TextFileReader {
  async loadData(file: string): Promise<string> {
    const content = await readFile(file, 'utf-8')
    return content
  }
}
