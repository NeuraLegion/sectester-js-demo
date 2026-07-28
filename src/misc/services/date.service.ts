import { BadRequestException, Injectable } from '@nestjs/common';

const MAX_DATE_RANGE_DAYS = 31;
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

@Injectable()
export class DateService {
  public async calculateWeekdays(
    from: string,
    to: string,
    weekDay = 1
  ): Promise<number> {
    const startDate = this.parseDate(from);
    const endDate = this.parseDate(to);

    if (startDate > endDate) {
      throw new BadRequestException('from must be less than or equal to to');
    }

    const rangeInDays = Math.floor(
      (endDate.getTime() - startDate.getTime()) / DAY_IN_MILLISECONDS
    );
    if (rangeInDays > MAX_DATE_RANGE_DAYS) {
      throw new BadRequestException(
        `Date range must not exceed ${MAX_DATE_RANGE_DAYS} days`
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

  private parseDate(value: string): Date {
    const parsedDate = new Date(`${value}T00:00:00.000Z`);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Invalid date value');
    }

    return parsedDate;
  }
}
