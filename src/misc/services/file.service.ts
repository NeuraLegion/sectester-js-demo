import { BadRequestException, Injectable } from '@nestjs/common';

const ALLOWED_FETCH_HOSTS = new Set(['example.com', 'www.example.com']);

@Injectable()
export class FileService {
  public async fetch(url: string): Promise<string> {
    const parsedUrl = this.validateFetchUrl(url);
    const response = await fetch(parsedUrl.toString(), {
      redirect: 'manual'
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
      throw new BadRequestException('Invalid URL');
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new BadRequestException('Only HTTP and HTTPS URLs are allowed');
    }

    if (parsedUrl.username || parsedUrl.password) {
      throw new BadRequestException('URL credentials are not allowed');
    }

    if (!ALLOWED_FETCH_HOSTS.has(parsedUrl.hostname)) {
      throw new BadRequestException('URL host is not allowed');
    }

    return parsedUrl;
  }
}
