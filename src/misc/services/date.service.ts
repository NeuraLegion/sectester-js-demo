import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class DateService {
  private readonly maxRangeDays = 184;

  public async calculateWeekdays(
    from: string,
    to: string,
    weekDay = 1
  ): Promise<number> {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(from) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(to)
    ) {
      throw new BadRequestException('Dates must use the YYYY-MM-DD format');
    }

    const startDate = new Date(`${from}T00:00:00.000Z`);
    const endDate = new Date(`${to}T00:00:00.000Z`);

    const isValidDate = (value: string, date: Date): boolean =>
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value;

    if (!isValidDate(from, startDate) || !isValidDate(to, endDate)) {
      throw new BadRequestException('Invalid date');
    }

    if (!Number.isInteger(weekDay) || weekDay < 0 || weekDay > 6) {
      throw new BadRequestException('Weekday must be an integer from 0 to 6');
    }

    if (endDate < startDate) {
      throw new BadRequestException(
        'The end date must not be before the start date'
      );
    }

    const rangeDays =
      Math.floor(
        (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
      ) + 1;

    if (rangeDays > this.maxRangeDays) {
      throw new BadRequestException(
        `The date range must not exceed ${this.maxRangeDays} days`
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
