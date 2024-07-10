import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtPayloadService {
  constructor(private readonly jwtService: JwtService) {}

  public decode(token: string): unknown {
    return this.jwtService.decode(token);
  }

  public update<T>(token: string, patch: Partial<T>): string {
    const payload: T = this.jwtService.decode(token);
    const { exp, iat, ...rest } = payload as any;

    return this.jwtService.sign({
      ...rest,
      ...patch
    });
  }

  public verify(token: string): boolean {
    try {
      this.jwtService.decode(token);

      return true;
    } catch (e) {
      return false;
    }
  }
}
