++ Update File: src/misc/services/file.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { isIP } from 'net';

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

// Hostnames that are commonly used to reach the local machine or
// well-known cloud metadata services and must never be reachable via a
// server-initiated outbound request.
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  'metadata.goog'
]);

/**
 * Determines whether a given IPv4/IPv6 address belongs to a private,
 * loopback, link-local, or otherwise reserved range that should never
 * be reachable via a server-initiated outbound request.
 */
function isPrivateOrReservedIp(ip: string): boolean {
  const version = isIP(ip);

  if (version === 4) {
    const parts = ip.split('.').map(Number);
    const [a, b] = parts;

    return (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224 // multicast/reserved
    );
  }

  if (version === 6) {
    const normalized = ip.toLowerCase();

    return (
      normalized === '::1' ||
      normalized === '::' ||
      normalized.startsWith('fe80:') || // link-local
      normalized.startsWith('fc') || // unique local fc00::/7
      normalized.startsWith('fd') ||
      normalized.startsWith('::ffff:127.') ||
      normalized.startsWith('::ffff:10.') ||
      normalized.startsWith('::ffff:169.254.') ||
      normalized.startsWith('::ffff:192.168.')
    );
  }

  return false;
}

@Injectable()
export class FileService {
  public async fetch(url: string): Promise<string> {
    this.assertUrlIsSafe(url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error fetching "${url}", status: ${response.status}`);
    }

    return response.text();
  }

  private assertUrlIsSafe(rawUrl: string): void {
    let parsed: URL;

    try {
      parsed = new URL(rawUrl);
    } catch {
      throw new BadRequestException('Invalid URL');
    }

    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      throw new BadRequestException(
        'Only http(s) URLs are allowed to be fetched'
      );
    }

    const hostname = parsed.hostname.toLowerCase();

    if (
      BLOCKED_HOSTNAMES.has(hostname) ||
      hostname.endsWith('.localhost')
    ) {
      throw new BadRequestException('Fetching this host is not allowed');
    }

    if (isIP(hostname) && isPrivateOrReservedIp(hostname)) {
      throw new BadRequestException('Fetching this host is not allowed');
    }
  }
}