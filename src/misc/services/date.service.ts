import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class DateService {
  private static readonly MAX_RANGE_DAYS = 31;

  public async calculateWeekdays(
    from: string,
    to: string,
    weekDay = 1
  ): Promise<number> {
    const startDate = new Date(from);
    const endDate = new Date(to);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      !Number.isInteger(weekDay) ||
      weekDay < 0 ||
      weekDay > 6
    ) {
      throw new BadRequestException('Invalid date range or weekday value');
    }

    if (startDate > endDate) {
      throw new BadRequestException(
        'The "from" date must be earlier than or equal to the "to" date'
      );
    }

    const rangeInDays = Math.floor(
      (endDate.getTime() - startDate.getTime()) / 86400000
    );

    if (rangeInDays > DateService.MAX_RANGE_DAYS) {
      throw new BadRequestException(
        `Date range must not exceed ${DateService.MAX_RANGE_DAYS} days`
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
