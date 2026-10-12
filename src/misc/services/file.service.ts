import { BadRequestException, Injectable } from '@nestjs/common';

const FETCH_TIMEOUT_MS = 10_000;
const ALLOWED_FETCH_PROTOCOL = 'https:';
const ALLOWED_FETCH_HOSTS = new Set(['example.com', 'brokencrystals.com']);

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

    if (!ALLOWED_FETCH_HOSTS.has(parsedUrl.hostname)) {
      throw new BadRequestException('URL host is not allowed');
    }

    return parsedUrl;
  }
}
