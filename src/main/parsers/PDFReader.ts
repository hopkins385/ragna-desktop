import { readFileSync } from 'fs';
import PDFParser from 'pdf2json';

export class PDFReader {
  async loadData(file: string): Promise<string> {
    const parser = new PDFParser(null, true);

    const text = await new Promise<string>((resolve, reject) => {
      const buffer = readFileSync(file);

      parser.on('pdfParser_dataError', (error) => {
        reject(error);
      });
      parser.on('pdfParser_dataReady', () => {
        resolve((parser as any).getRawTextContent() as string);
      });
      parser.parseBuffer(buffer);
    });
    return text.split(/----------------Page \(\d+\) Break----------------/g).join('');
  }
}
