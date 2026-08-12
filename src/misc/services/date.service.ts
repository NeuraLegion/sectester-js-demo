import { BadRequestException, Injectable } from '@nestjs/common';

const MAX_RANGE_DAYS = 366;

@Injectable()
export class DateService {
  public async calculateWeekdays(
    from: string,
    to: string,
    weekDay = 1
  ): Promise<number> {
    const startDate = new Date(from);
    const endDate = new Date(to);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException(
        'Invalid "from" or "to" date format; expected YYYY-MM-DD'
      );
    }

    if (endDate < startDate) {
      throw new BadRequestException('"to" must be on or after "from"');
    }

    const rangeDays =
      (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000);
    if (rangeDays > MAX_RANGE_DAYS) {
      throw new BadRequestException(
        `Date range too large; maximum allowed span is ${MAX_RANGE_DAYS} days`
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
