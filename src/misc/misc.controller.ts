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
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

class FetchDto {
  @ApiProperty({ description: 'URL to fetch content from' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  public url!: string;
}

class WeekdaysResponseDto {
  @ApiProperty({ description: 'Number of weekdays in the given range' })
  public count!: number;
}

@Controller('misc')
@ApiTags('misc')
export class MiscController {
  private static readonly DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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
    return this.fileService.fetch(body.url);
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
      !from ||
      !to ||
      !MiscController.DATE_ONLY_PATTERN.test(from) ||
      !MiscController.DATE_ONLY_PATTERN.test(to)
    ) {
      throw new BadRequestException(
        'The "from" and "to" query parameters must use YYYY-MM-DD format'
      );
    }

    const parsedWeekday = weekday === undefined ? 1 : Number(weekday);

    if (!Number.isInteger(parsedWeekday) || parsedWeekday < 0 || parsedWeekday > 6) {
      throw new BadRequestException(
        'The "weekday" query parameter must be an integer between 0 and 6'
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
