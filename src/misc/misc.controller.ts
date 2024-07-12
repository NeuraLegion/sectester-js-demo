import { DateService, FileService, XmlService } from './services';
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
    private readonly dateService: DateService,
    private readonly fileService: FileService,
    private readonly xmlService: XmlService
  ) {}

  @Post('/fetch')
  public fetch(@Body() body: { url: string }): Promise<string> {
    return this.fileService.fetch(body.url);
  }

  @Post('/xml')
  public parse(@Req() req: RawBodyRequest<Request>): Promise<string> {
    return this.xmlService.parse(req.body.toString());
  }

  @Get('/weekdays')
  public async weekdays(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('weekday') weekday?: number
  ): Promise<string> {
    const count = await this.dateService.calculateWeekdays(
      from,
      to,
      weekday ?? 1
    );

    return JSON.stringify({ count }, null, 2);
  }
}
