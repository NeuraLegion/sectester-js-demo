import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class DateService {
  public async calculateWeekdays(
    from: string,
    to: string,
    weekDay = 1
  ): Promise<number> {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const maxRangeInDays = 31;

    if (!datePattern.test(from) || !datePattern.test(to)) {
      throw new BadRequestException('Dates must use YYYY-MM-DD format');
    }

    if (!Number.isInteger(weekDay) || weekDay < 0 || weekDay > 6) {
      throw new BadRequestException('weekday must be an integer between 0 and 6');
    }

    const startDate = new Date(`${from}T00:00:00.000Z`);
    const endDate = new Date(`${to}T00:00:00.000Z`);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      startDate.toISOString().slice(0, 10) !== from ||
      endDate.toISOString().slice(0, 10) !== to
    ) {
      throw new BadRequestException('Invalid date values provided');
    }

    if (startDate > endDate) {
      throw new BadRequestException('The from date must be before or equal to the to date');
    }

    const rangeInDays =
      (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000);
    if (rangeInDays > maxRangeInDays) {
      throw new BadRequestException(
        `Date range must not exceed ${maxRangeInDays} days`
      );
    }

    let counter = 0;
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
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
