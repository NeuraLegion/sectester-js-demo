import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';

@Injectable()
export class UsersAuthGuard implements CanActivate {
  public canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{
        user?: { id?: number };
        params?: { id?: string };
      }>();

    if (!request.user || !Number.isInteger(request.user.id)) {
      throw new UnauthorizedException();
    }

    const requestedId = Number(request.params?.id);
    if (!Number.isInteger(requestedId) || request.user.id !== requestedId) {
      throw new ForbiddenException();
    }

    return true;
  }
}
