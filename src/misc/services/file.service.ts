import { BadRequestException, Injectable } from '@nestjs/common';

const ALLOWED_FETCH_HOSTS = new Set(['example.com', 'www.example.com']);

@Injectable()
export class FileService {
  public async fetch(url: string): Promise<string> {
    const parsedUrl = this.validateUrl(url);
    const response = await fetch(parsedUrl, { redirect: 'error' });
    if (!response.ok) {
      throw new Error(
        `Error fetching "${parsedUrl.toString()}", status: ${response.status}`
      );
    }

    return response.text();
  }

  private validateUrl(url: string): URL {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      throw new BadRequestException('Invalid URL');
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new BadRequestException('Only HTTP and HTTPS URLs are allowed');
    }

    const hostname = parsedUrl.hostname.toLowerCase();

    if (!ALLOWED_FETCH_HOSTS.has(hostname)) {
      throw new BadRequestException('Target host is not allowed');
    }

    parsedUrl.username = '';
    parsedUrl.password = '';

    return parsedUrl;
  }
}
