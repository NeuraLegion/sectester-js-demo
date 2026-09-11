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

const DATE_RANGE_MAX_DAYS = 31;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseDateOnly(value: string): Date | null {
  if (!DATE_ONLY_PATTERN.test(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return null;
  }

  return parsedDate;
}

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
    if (!body || typeof body.url !== 'string' || body.url.trim().length === 0) {
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
    const startDate = parseDateOnly(from);
    const endDate = parseDateOnly(to);

    if (!startDate || !endDate) {
      throw new BadRequestException('from and to must be valid dates in YYYY-MM-DD format');
    }

    if (startDate > endDate) {
      throw new BadRequestException('from must be less than or equal to to');
    }

    const rangeLengthInDays =
      Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1;

    if (rangeLengthInDays > DATE_RANGE_MAX_DAYS) {
      throw new BadRequestException(
        `Date range must not exceed ${DATE_RANGE_MAX_DAYS} days`
      );
    }

    const parsedWeekday = weekday === undefined ? 1 : Number(weekday);

    if (
      !Number.isInteger(parsedWeekday) ||
      parsedWeekday < 0 ||
      parsedWeekday > 6
    ) {
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
