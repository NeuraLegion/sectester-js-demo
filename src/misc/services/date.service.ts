import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class DateService {
  public static readonly MAX_DATE_RANGE_DAYS = 31;

  private static readonly ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

  private static parseDateInput(value: string): Date | null {
    const match = DateService.ISO_DATE_RE.exec(value);
    if (!match) {
      return null;
    }

    const [, year, month, day] = match;
    const parsedDate = new Date(
      Date.UTC(Number(year), Number(month) - 1, Number(day))
    );

    if (
      parsedDate.getUTCFullYear() !== Number(year) ||
      parsedDate.getUTCMonth() !== Number(month) - 1 ||
      parsedDate.getUTCDate() !== Number(day)
    ) {
      return null;
    }

    return parsedDate;
  }

  public async calculateWeekdays(
    from: string,
    to: string,
    weekDay = 1
  ): Promise<number> {
    const startDate = DateService.parseDateInput(from);
    const endDate = DateService.parseDateInput(to);

    if (!startDate || !endDate) {
      throw new BadRequestException('Dates must be valid and use YYYY-MM-DD format');
    }

    if (!Number.isInteger(weekDay) || weekDay < 0 || weekDay > 6) {
      throw new BadRequestException('Weekday must be an integer between 0 and 6');
    }

    if (startDate.getTime() > endDate.getTime()) {
      throw new BadRequestException('The "from" date must be before or equal to the "to" date');
    }

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const rangeInDays =
      (endDate.getTime() - startDate.getTime()) / millisecondsPerDay + 1;

    if (rangeInDays > DateService.MAX_DATE_RANGE_DAYS) {
      throw new BadRequestException(
        `Date range must not exceed ${DateService.MAX_DATE_RANGE_DAYS} days`
      );
    }

    let counter = 0;
    const currentDate = new Date(startDate);
    while (currentDate.getTime() <= endDate.getTime()) {
      if (currentDate.getUTCDay() === weekDay) {
        counter++;
      }

      if (counter % 100 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return counter;
  }
}
