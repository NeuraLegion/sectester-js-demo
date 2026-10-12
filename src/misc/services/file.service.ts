import { BadRequestException, Injectable } from '@nestjs/common';

const FETCH_TIMEOUT_MS = 10_000;
const ALLOWED_FETCH_HOSTS = new Set(['example.com', 'www.example.com']);

@Injectable()
export class FileService {
  public async fetch(url: string): Promise<string> {
    const validatedUrl = this.validateUrl(url);

    const response = await fetch(validatedUrl, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: 'error'
    });
    if (!response.ok) {
      throw new Error(
        `Error fetching "${validatedUrl}", status: ${response.status}`
      );
    }

    return response.text();
  }

  private validateUrl(url: string): string {
    if (typeof url !== 'string' || url.trim() === '') {
      throw new BadRequestException('URL must be a non-empty string');
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      throw new BadRequestException('URL must be a valid absolute URL');
    }

    const hostname = parsedUrl.hostname.replace(/\.$/, '').toLowerCase();

    if (parsedUrl.protocol !== 'https:') {
      throw new BadRequestException('Only HTTPS URLs are allowed');
    }

    if (parsedUrl.username || parsedUrl.password) {
      throw new BadRequestException('Credentials in URL are not allowed');
    }

    if (parsedUrl.port && parsedUrl.port !== '443') {
      throw new BadRequestException('Custom ports are not allowed');
    }

    if (!ALLOWED_FETCH_HOSTS.has(hostname)) {
      throw new BadRequestException('URL host is not allowed');
    }

    return parsedUrl.toString();
  }
}
