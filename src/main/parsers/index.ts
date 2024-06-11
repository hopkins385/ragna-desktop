export { TextFileReader } from './TextFileReader'
export { PDFReader } from './PDFReader'
export { DocxParser } from './DocxParser'

export interface FileReader {
  loadData(filePath: string): Promise<string>
}
