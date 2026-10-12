import { BadRequestException, Injectable } from '@nestjs/common';

const FETCH_TIMEOUT_MS = 10_000;
const ALLOWED_FETCH_PROTOCOL = 'https:';
const ALLOWED_FETCH_URLS = new Set([
  'https://example.com/',
  'https://brokencrystals.com/config.js'
]);

@Injectable()
export class FileService {
  public async fetch(url: string): Promise<string> {
    const parsedUrl = this.validateFetchUrl(url);
    const response = await fetch(parsedUrl.toString(), {
      redirect: 'error',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });
    if (!response.ok) {
      throw new Error(
        `Error fetching "${parsedUrl.toString()}", status: ${response.status}`
      );
    }

    return response.text();
  }

  private validateFetchUrl(url: string): URL {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      throw new BadRequestException('Invalid URL format');
    }

    if (parsedUrl.protocol !== ALLOWED_FETCH_PROTOCOL) {
      throw new BadRequestException('Only HTTPS URLs are allowed');
    }

    if (parsedUrl.username || parsedUrl.password) {
      throw new BadRequestException('Credentials in the URL are not allowed');
    }

    if (parsedUrl.port && parsedUrl.port !== '443') {
      throw new BadRequestException('Only the default HTTPS port is allowed');
    }

    if (parsedUrl.hash) {
      throw new BadRequestException('URL fragments are not allowed');
    }

    const normalizedUrl = parsedUrl.toString();

    if (!ALLOWED_FETCH_URLS.has(normalizedUrl)) {
      throw new BadRequestException('URL is not allowed');
    }

    return parsedUrl;
  }
}
