/* eslint-disable max-classes-per-file */
import { DateService, FileService, XmlService } from './services';
import { ALLOWED_FETCH_HOSTS } from './services/file.service';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  RawBodyRequest,
  Req
} from '@nestjs/common';
import {
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiQuery,
  ApiProperty
} from '@nestjs/swagger';
import { IncomingMessage } from 'http';

class FetchDto {
  @ApiProperty({
    description:
      'URL to fetch content from. Only approved HTTPS resources are allowed.'
  })
  public url!: string;
}

class WeekdaysResponseDto {
  @ApiProperty({ description: 'Number of weekdays in the given range' })
  public count!: number;
}

@Controller('misc')
@ApiTags('misc')
export class MiscController {
  constructor(
    private readonly dateService: DateService,
    private readonly fileService: FileService,
    private readonly xmlService: XmlService
  ) {}

  @Post('/fetch')
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched the content from the URL',
    type: String
  })
  @ApiBody({ type: FetchDto })
  public fetch(@Body() body: FetchDto): Promise<string> {
    if (typeof body?.url !== 'string' || body.url.trim().length === 0) {
      throw new BadRequestException('A non-empty URL is required');
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(body.url);
    } catch {
      throw new BadRequestException('URL must be a valid absolute URL');
    }

    const normalizedHostname = parsedUrl.hostname.replace(/\.$/, '').toLowerCase();

    if (
      parsedUrl.protocol !== 'https:' ||
      parsedUrl.username ||
      parsedUrl.password ||
      !ALLOWED_FETCH_HOSTS.has(normalizedHostname)
    ) {
      throw new BadRequestException(
        'Only approved HTTPS URLs are allowed'
      );
    }

    return this.fileService.fetch(parsedUrl.toString());
  }

  @Post('/xml')
  @ApiResponse({
    status: 200,
    description: 'Successfully parsed XML',
    type: Object
  })
  @ApiBody({ type: String, description: 'Raw XML string' })
  public parse(@Req() req: RawBodyRequest<IncomingMessage>): Promise<string> {
    if (!req.rawBody) {
      throw new BadRequestException('Request body is required');
    }

    return this.xmlService.parse(req.rawBody.toString());
  }

  @Get('/weekdays')
  @ApiResponse({
    status: 200,
    description:
      'Successfully calculated number of given weekday in date range',
    type: WeekdaysResponseDto
  })
  @ApiQuery({
    name: 'from',
    required: true,
    type: String,
    description: 'Start date (YYYY-MM-DD)'
  })
  @ApiQuery({
    name: 'to',
    required: true,
    type: String,
    description: 'End date (YYYY-MM-DD)'
  })
  @ApiQuery({
    name: 'weekday',
    required: false,
    type: Number,
    description: 'Weekday number (0-6, where 0 is Sunday)'
  })
  public async weekdays(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('weekday') weekday?: string
  ): Promise<{ count: number }> {
    const count = await this.dateService.calculateWeekdays(
      from,
      to,
      weekday ? +weekday : 1
    );

    return { count };
  }
}
