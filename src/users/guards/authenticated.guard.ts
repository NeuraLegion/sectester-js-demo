import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';

export interface AuthenticatedRequest {
  headers: Record<string, string | string[] | undefined>;
  user?: { id: number };
}

/**
 * Minimal, dependency-free authentication guard.
 *
 * It expects the caller to present a `Authorization: Bearer <userId>`
 * header identifying who is making the request. The resolved principal
 * is attached to the request (`request.user`) so that route handlers can
 * perform authorization checks (e.g. only letting a user access their own
 * record) instead of returning data to any anonymous caller.
 */
@Injectable()
export class AuthenticatedGuard implements CanActivate {
  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const rawHeader = request.headers.authorization;
    const header = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader ?? '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        'Authentication is required to access this resource.'
      );
    }

    const principalId = Number(token);

    if (!Number.isInteger(principalId) || principalId <= 0) {
      throw new UnauthorizedException('Invalid authentication token.');
    }

    request.user = { id: principalId };

    return true;
  }
}
