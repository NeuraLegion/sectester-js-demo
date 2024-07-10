import { MiscService } from './misc.service';
import { JwtPayloadService } from './services';
import type { Request } from 'express';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  RawBodyRequest,
  Req,
  UnauthorizedException
} from '@nestjs/common';

@Controller('misc')
export class MiscController {
  constructor(
    private readonly jwtPayloadService: JwtPayloadService,
    private readonly miscService: MiscService
  ) {}

  @Post('/render')
  public render(
    @Body() body: { template: string; params?: Record<string, any> }
  ): Promise<string> {
    return this.miscService.render(body.template, body.params ?? {});
  }

  @Post('/fetch')
  public fetch(@Body() body: { url: string }): Promise<string> {
    return this.miscService.fetch(body.url);
  }

  @Post('/xml')
  public async parse(@Req() req: RawBodyRequest<Request>): Promise<string> {
    const parsed = await this.miscService.parse(req.body.toString());

    return JSON.stringify(parsed, null, 2);
  }

  @Get('/weekdays')
  public async weekdays(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('weekday') weekday?: number
  ): Promise<string> {
    const count = await this.miscService.calculateWeekdays(
      from,
      to,
      weekday ?? 1
    );

    return JSON.stringify({ count }, null, 2);
  }

  @Get('/jwt/decode')
  public decodeJwt(@Query('token') token: string) {
    if (!token) {
      throw new UnauthorizedException('Missing JWT token');
    }

    return this.jwtPayloadService.decode(token);
  }

  @Get('/jwt/verify')
  public verifyJwt(@Query('token') token: string) {
    if (!token) {
      throw new UnauthorizedException('Missing JWT token');
    }

    return { valid: this.jwtPayloadService.verify(token) };
  }

  @Post('/jwt/update')
  public updateJwt(
    @Query('token') token: string,
    @Body() body: Record<string, any>
  ) {
    if (!token) {
      throw new UnauthorizedException('Missing JWT token');
    }

    return { token: this.jwtPayloadService.update(token, body) };
  }
}
