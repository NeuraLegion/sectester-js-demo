import { BadRequestException, Injectable } from '@nestjs/common';

const ALLOWED_FETCH_URLS = new Set([
  'https://example.com/',
  'https://www.example.com/'
]);

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

    if (parsedUrl.protocol !== 'https:') {
      throw new BadRequestException('Only HTTPS URLs are allowed');
    }

    if (parsedUrl.username || parsedUrl.password) {
      throw new BadRequestException('Credentials in URL are not allowed');
    }

    if (parsedUrl.port && parsedUrl.port !== '443') {
      throw new BadRequestException('Target port is not allowed');
    }

    if (parsedUrl.search || parsedUrl.hash) {
      throw new BadRequestException('Query strings and fragments are not allowed');
    }

    const normalizedUrl = parsedUrl.toString();

    if (!ALLOWED_FETCH_URLS.has(normalizedUrl)) {
      throw new BadRequestException('Target URL is not allowed');
    }

    return parsedUrl;
  }
}
