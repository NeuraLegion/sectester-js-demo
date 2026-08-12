++ src/misc/services/file.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Explicit allowlist of hosts that this service is permitted to fetch
 * content from. Restricting outbound requests to a known-safe set of
 * destinations is the recommended mitigation for Server-Side Request
 * Forgery (SSRF): without it, an attacker can supply an arbitrary URL
 * (internal services, cloud metadata endpoints, or an attacker-controlled
 * host) and have the server issue a request to it on their behalf.
 *
 * The list can be extended via the `FETCH_ALLOWED_HOSTS` environment
 * variable (comma separated hostnames) without code changes.
 */
const DEFAULT_ALLOWED_HOSTS = ['example.com', 'brightsec.com'];

function getAllowedHosts(): string[] {
  const configured = process.env.FETCH_ALLOWED_HOSTS;

  if (!configured) {
    return DEFAULT_ALLOWED_HOSTS;
  }

  return configured
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

function isHostAllowed(hostname: string, allowedHosts: string[]): boolean {
  const normalizedHost = hostname.toLowerCase();

  return allowedHosts.some(
    (allowed) =>
      normalizedHost === allowed || normalizedHost.endsWith(`.${allowed}`)
  );
}

@Injectable()
export class FileService {
  public async fetch(url: string): Promise<string> {
    this.validateUrl(url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching "${url}", status: ${response.status}`);
    }

    return response.text();
  }

  private validateUrl(url: string): void {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      throw new BadRequestException('Invalid URL');
    }

    if (!ALLOWED_PROTOCOLS.has(parsedUrl.protocol)) {
      throw new BadRequestException(
        `Unsupported protocol "${parsedUrl.protocol}"`
      );
    }

    const allowedHosts = getAllowedHosts();

    if (!isHostAllowed(parsedUrl.hostname, allowedHosts)) {
      throw new BadRequestException(
        `Fetching content from "${parsedUrl.hostname}" is not permitted`
      );
    }
  }
}
