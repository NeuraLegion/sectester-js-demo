import { BadRequestException, Injectable } from '@nestjs/common';

const ALLOWED_FETCH_HOSTS = new Set(['example.com', 'www.example.com']);

@Injectable()
export class FileService {
  public async fetch(url: string): Promise<string> {
    const parsedUrl = this.parseAndValidateUrl(url);
    const response = await fetch(parsedUrl.toString());
    if (!response.ok) {
      throw new Error(
        `Error fetching "${parsedUrl.toString()}", status: ${response.status}`
      );
    }

    return response.text();
  }

  private parseAndValidateUrl(url: string): URL {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      throw new BadRequestException('A valid HTTPS URL is required');
    }

    if (
      parsedUrl.protocol !== 'https:' ||
      !ALLOWED_FETCH_HOSTS.has(parsedUrl.hostname.toLowerCase()) ||
      !['', '443'].includes(parsedUrl.port) ||
      parsedUrl.username ||
      parsedUrl.password
    ) {
      throw new BadRequestException(
        'Only HTTPS URLs from approved hosts are allowed'
      );
    }

    return parsedUrl;
  }
}
