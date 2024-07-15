import { Injectable } from '@nestjs/common';

@Injectable()
export class FileService {
  public async fetch(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching "${url}", status: ${response.status}`);
    }

    return response.text();
  }
}
