import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class FileService {
  private static readonly ALLOWED_HOSTNAMES = new Set([
    'example.com',
    'www.example.com'
  ]);

  private static readonly SAFE_FETCH_OPTIONS: RequestInit = {
    redirect: 'error'
  };

  public async fetch(url: string): Promise<string> {
    const targetUrl = this.validateUrl(url);
    const response = await fetch(
      targetUrl.toString(),
      FileService.SAFE_FETCH_OPTIONS
    );

    if (!response.ok) {
      throw new Error(
        `Error fetching "${targetUrl.toString()}", status: ${response.status}`
      );
    }

    return response.text();
  }

  private validateUrl(url: string): URL {
    let targetUrl: URL;

    try {
      targetUrl = new URL(url);
    } catch {
      throw new BadRequestException('Invalid URL');
    }

    if (targetUrl.protocol !== 'https:') {
      throw new BadRequestException('Only HTTPS URLs are allowed');
    }

    if (targetUrl.username || targetUrl.password) {
      throw new BadRequestException(
        'URLs with embedded credentials are not allowed'
      );
    }

    if (targetUrl.port && targetUrl.port !== '443') {
      throw new BadRequestException('Only the default HTTPS port is allowed');
    }

    if (
      !FileService.ALLOWED_HOSTNAMES.has(targetUrl.hostname.toLowerCase())
    ) {
      throw new BadRequestException('URL hostname is not allowed');
    }

    return targetUrl;
  }
}
