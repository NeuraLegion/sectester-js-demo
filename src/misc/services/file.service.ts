import { Injectable } from '@nestjs/common';

const FETCH_TIMEOUT_MS = 10_000;

@Injectable()
export class FileService {
  public async fetch(url: string): Promise<string> {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });
    if (!response.ok) {
      throw new Error(`Error fetching "${url}", status: ${response.status}`);
    }

    return response.text();
  }
}
