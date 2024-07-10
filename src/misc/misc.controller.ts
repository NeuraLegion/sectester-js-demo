import { MiscService } from './misc.service';
import type { Request } from 'express';
import { Body, Controller, Post, RawBodyRequest, Req } from '@nestjs/common';

@Controller('misc')
export class MiscController {
  constructor(private readonly miscService: MiscService) {}

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
}
