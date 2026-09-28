import { BadRequestException, Injectable } from '@nestjs/common';

const ALLOWED_HOSTS = new Set(['example.com']);

@Injectable()
export class FileService {
  public async fetch(url: string): Promise<string> {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      throw new BadRequestException('Invalid URL');
    }

    if (
      parsedUrl.protocol !== 'https:' ||
      !ALLOWED_HOSTS.has(parsedUrl.hostname)
    ) {
      throw new BadRequestException('URL is not allowed');
    }

    const response = await fetch(parsedUrl, { redirect: 'error' });
    if (!response.ok) {
      throw new Error(
        `Error fetching "${parsedUrl.toString()}", status: ${response.status}`
      );
    }

    return response.text();
  }
}
