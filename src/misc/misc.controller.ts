/* eslint-disable max-classes-per-file */
import { DateService, FileService, XmlService } from './services';
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
  @ApiProperty({ description: 'URL to fetch content from' })
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
    if (!body || typeof body.url !== 'string') {
      throw new BadRequestException('URL must be provided as a string');
    }

    return this.fileService.fetch(this.normalizeFetchUrl(body.url));
  }

  private normalizeFetchUrl(url: string): string {
    const trimmedUrl = url.trim();

    if (trimmedUrl === '') {
      throw new BadRequestException('URL must be provided as a string');
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(trimmedUrl);
    } catch {
      throw new BadRequestException('URL must be a valid absolute URL');
    }

    const hostname = parsedUrl.hostname.replace(/\.$/, '').toLowerCase();

    if (parsedUrl.protocol !== 'https:') {
      throw new BadRequestException('Only HTTPS URLs are allowed');
    }

    if (parsedUrl.username || parsedUrl.password) {
      throw new BadRequestException('Credentials in URL are not allowed');
    }

    if (parsedUrl.port && parsedUrl.port !== '443') {
      throw new BadRequestException('Custom ports are not allowed');
    }

    if (!['example.com', 'www.example.com'].includes(hostname)) {
      throw new BadRequestException('URL host is not allowed');
    }

    return parsedUrl.toString();
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
