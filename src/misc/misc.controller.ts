import { MiscService } from './misc.service';
import { XmlService } from './services';
import type { Request } from 'express';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  RawBodyRequest,
  Req
} from '@nestjs/common';

@Controller('misc')
export class MiscController {
  constructor(
    private readonly miscService: MiscService,
    private readonly xmlService: XmlService
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
    const parsed = await this.xmlService.parse(req.body.toString());

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
}
