import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { Request } from 'express';

type AuthenticatedRequest = Request & {
  user?: {
    id: number;
  };
};

@Injectable()
export class UserIdentityGuard implements CanActivate {
  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userIdHeader = this.getSingleHeaderValue(request.headers['x-user-id']);
    const userTokenHeader = this.getSingleHeaderValue(
      request.headers['x-user-token']
    );
    const authSecret = process.env.USER_AUTH_SECRET;

    if (!authSecret || !userIdHeader || !userTokenHeader) {
      throw new UnauthorizedException('Authentication required.');
    }

    if (!/^\d+$/.test(userIdHeader)) {
      throw new UnauthorizedException('Authentication required.');
    }

    const userId = Number.parseInt(userIdHeader, 10);
    const expectedToken = createHmac('sha256', authSecret)
      .update(`user:${userId}`)
      .digest('hex');

    if (!this.matches(expectedToken, userTokenHeader)) {
      throw new UnauthorizedException('Authentication required.');
    }

    request.user = { id: userId };

    return true;
  }

  private getSingleHeaderValue(value?: string | string[]): string | null {
    if (typeof value === 'string') {
      return value;
    }

    return Array.isArray(value) && value.length === 1 ? value[0] : null;
  }

  private matches(expected: string, actual: string): boolean {
    const expectedBuffer = Buffer.from(expected, 'utf8');
    const actualBuffer = Buffer.from(actual, 'utf8');

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, actualBuffer);
  }
}
