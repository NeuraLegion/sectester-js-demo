import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class DateService {
  private static readonly DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

  private static readonly MAX_RANGE_DAYS = 31;

  public async calculateWeekdays(
    from: string,
    to: string,
    weekDay = 1
  ): Promise<number> {
    if (!Number.isInteger(weekDay) || weekDay < 0 || weekDay > 6) {
      throw new BadRequestException('weekday must be an integer between 0 and 6');
    }

    if (
      !DateService.DATE_ONLY_PATTERN.test(from)
      || !DateService.DATE_ONLY_PATTERN.test(to)
    ) {
      throw new BadRequestException('from and to must use YYYY-MM-DD format');
    }

    const startDate = new Date(`${from}T00:00:00.000Z`);
    const endDate = new Date(`${to}T00:00:00.000Z`);

    if (
      Number.isNaN(startDate.getTime())
      || Number.isNaN(endDate.getTime())
      || startDate.toISOString().slice(0, 10) !== from
      || endDate.toISOString().slice(0, 10) !== to
    ) {
      throw new BadRequestException('from and to must be valid calendar dates');
    }

    if (startDate > endDate) {
      throw new BadRequestException('from must be less than or equal to to');
    }

    const rangeInDays = Math.floor(
      (endDate.getTime() - startDate.getTime()) / 86400000
    );

    if (rangeInDays > DateService.MAX_RANGE_DAYS) {
      throw new BadRequestException(
        `date range must not exceed ${DateService.MAX_RANGE_DAYS} days`
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
