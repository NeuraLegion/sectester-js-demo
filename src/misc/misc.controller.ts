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

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MAX_DATE_RANGE_DAYS = 183;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDateOnly(value: string, fieldName: string): Date {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) {
    throw new BadRequestException(
      `${fieldName} must be a valid date in YYYY-MM-DD format`
    );
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new BadRequestException(
      `${fieldName} must be a valid date in YYYY-MM-DD format`
    );
  }

  return date;
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
      throw new BadRequestException('URL is required');
    }

    return this.fileService.fetch(body.url.trim());
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
    const startDate = parseDateOnly(from, 'from');
    const endDate = parseDateOnly(to, 'to');

    if (startDate > endDate) {
      throw new BadRequestException('from must be before or equal to to');
    }

    const rangeInDays = (endDate.getTime() - startDate.getTime()) / MS_PER_DAY;
    if (rangeInDays > MAX_DATE_RANGE_DAYS) {
      throw new BadRequestException(
        'Date range must not exceed 183 days'
      );
    }

    const parsedWeekday = weekday === undefined || weekday === '' ? 1 : Number(weekday);
    if (!Number.isInteger(parsedWeekday) || parsedWeekday < 0 || parsedWeekday > 6) {
      throw new BadRequestException('weekday must be an integer between 0 and 6');
    }

    const count = await this.dateService.calculateWeekdays(
      from,
      to,
      parsedWeekday
    );

    return { count };
  }
}
