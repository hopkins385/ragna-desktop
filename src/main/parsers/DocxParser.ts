import { readFileSync } from 'node:fs';
import { parseOfficeAsync } from 'officeparser';

export class DocxParser {
  async loadData(filePath: string): Promise<string> {
    const dataBuffer = readFileSync(filePath);
    const value = await parseOfficeAsync(dataBuffer);
    return value;
  }
}
