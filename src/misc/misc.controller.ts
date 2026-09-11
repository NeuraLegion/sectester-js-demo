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
  private static readonly ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

  constructor(
    private readonly dateService: DateService,
    private readonly fileService: FileService,
    private readonly xmlService: XmlService
  ) {}

  private static isValidIsoDate(value: string): boolean {
    const match = MiscController.ISO_DATE_RE.exec(value);
    if (!match) {
      return false;
    }

    const [, year, month, day] = match;
    const parsedDate = new Date(
      Date.UTC(Number(year), Number(month) - 1, Number(day))
    );

    return (
      parsedDate.getUTCFullYear() === Number(year) &&
      parsedDate.getUTCMonth() === Number(month) - 1 &&
      parsedDate.getUTCDate() === Number(day)
    );
  }

  private static getDateRangeInDays(from: string, to: string): number {
    const startDate = new Date(`${from}T00:00:00.000Z`);
    const endDate = new Date(`${to}T00:00:00.000Z`);
    const millisecondsPerDay = 24 * 60 * 60 * 1000;

    return (endDate.getTime() - startDate.getTime()) / millisecondsPerDay + 1;
  }

  @Post('/fetch')
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched the content from the URL',
    type: String
  })
  @ApiBody({ type: FetchDto })
  public fetch(@Body() body: FetchDto): Promise<string> {
    if (typeof body?.url !== 'string' || body.url.trim() === '') {
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
    if (
      typeof from !== 'string' ||
      typeof to !== 'string' ||
      !MiscController.isValidIsoDate(from) ||
      !MiscController.isValidIsoDate(to)
    ) {
      throw new BadRequestException(
        'Dates must be valid and use YYYY-MM-DD format'
      );
    }

    const parsedWeekday = weekday === undefined ? 1 : Number(weekday);
    if (
      !Number.isInteger(parsedWeekday) ||
      parsedWeekday < 0 ||
      parsedWeekday > 6
    ) {
      throw new BadRequestException('Weekday must be an integer between 0 and 6');
    }

    const rangeInDays = MiscController.getDateRangeInDays(from, to);
    if (rangeInDays < 1) {
      throw new BadRequestException(
        'The "from" date must be before or equal to the "to" date'
      );
    }

    if (rangeInDays > DateService.MAX_DATE_RANGE_DAYS) {
      throw new BadRequestException(
        `Date range must not exceed ${DateService.MAX_DATE_RANGE_DAYS} days`
      );
    }

    const count = await this.dateService.calculateWeekdays(
      from,
      to,
      parsedWeekday
    );

    return { count };
  }
}
