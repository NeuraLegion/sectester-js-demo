import { BadRequestException, Injectable } from '@nestjs/common';

const MAX_RANGE_DAYS = 180;

@Injectable()
export class DateService {
  public async calculateWeekdays(
    from: string,
    to: string,
    weekDay = 1
  ): Promise<number> {
    const startDate = new Date(from);
    const endDate = new Date(to);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date(s) provided');
    }

    if (!Number.isInteger(weekDay) || weekDay < 0 || weekDay > 6) {
      throw new BadRequestException('Weekday must be an integer between 0 and 6');
    }

    const rangeMs = endDate.getTime() - startDate.getTime();
    const maxRangeMs = MAX_RANGE_DAYS * 24 * 60 * 60 * 1000;

    if (rangeMs < 0) {
      throw new BadRequestException('"from" date must not be after "to" date');
    }

    if (rangeMs > maxRangeMs) {
      throw new BadRequestException(
        `Date range must not exceed ${MAX_RANGE_DAYS} days`
      );
    }

    let counter = 0;
    const currentDate = startDate;
    while (currentDate <= endDate) {
      if (currentDate.getDay() === weekDay) {
        counter++;
      }

      if (counter % 100 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return counter;
  }
}
