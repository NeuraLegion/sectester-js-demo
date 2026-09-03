import { BadRequestException, Injectable } from '@nestjs/common';

const ALLOWED_FETCH_HOSTS = new Set(['example.com', 'brokencrystals.com']);

@Injectable()
export class FileService {
  public async fetch(url: string): Promise<string> {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      throw new BadRequestException('URL must be a valid absolute URL');
    }

    if (
      parsedUrl.protocol !== 'https:' ||
      !ALLOWED_FETCH_HOSTS.has(parsedUrl.hostname)
    ) {
      throw new BadRequestException('URL host is not allowed');
    }

    const response = await fetch(parsedUrl.toString(), { redirect: 'error' });
    if (!response.ok) {
      throw new Error(`Error fetching "${url}", status: ${response.status}`);
    }

    return response.text();
  }
}
