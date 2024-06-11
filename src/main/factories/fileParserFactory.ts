import { TextFileReader, PDFReader, DocxParser } from '../parsers';
import type { FileReader } from '../parsers';

export class FileParserFactory {
  type: string;
  filePath: string;
  reader: FileReader;

  constructor(filePath: string) {
    if (!filePath) throw new Error('File path is required');
    this.filePath = filePath;
    this.type = this.getType();
    this.reader = this.getReader();
  }

  async loadData() {
    return await this.reader.loadData(this.filePath);
  }

  getType() {
    // determine type based on file-extension
    const parts = this.filePath.split('.');
    return parts[parts.length - 1];
  }

  getReader() {
    switch (this.type) {
      case 'txt':
        return new TextFileReader();
      case 'pdf':
        return new PDFReader();
      case 'docx':
        return new DocxParser();
      default:
        throw new Error(`Unsupported file type: ${this.type}`);
    }
  }
}
