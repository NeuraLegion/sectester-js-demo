import { BadRequestException, Injectable } from '@nestjs/common';

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MAX_DATE_RANGE_DAYS = 183;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseDateOnly(value: string, fieldName: string): Date {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) {
    throw new BadRequestException(
      `${fieldName} must be a valid date in YYYY-MM-DD format`
    );
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new BadRequestException(
      `${fieldName} must be a valid date in YYYY-MM-DD format`
    );
  }

  return date;
}

@Injectable()
export class DateService {
  public async calculateWeekdays(
    from: string,
    to: string,
    weekDay = 1
  ): Promise<number> {
    if (!Number.isInteger(weekDay) || weekDay < 0 || weekDay > 6) {
      throw new BadRequestException('weekday must be an integer between 0 and 6');
    }

    const startDate = parseDateOnly(from, 'from');
    const endDate = parseDateOnly(to, 'to');

    if (startDate > endDate) {
      throw new BadRequestException('from must be before or equal to to');
    }

    const rangeInDays = (endDate.getTime() - startDate.getTime()) / MS_PER_DAY;
    if (rangeInDays > MAX_DATE_RANGE_DAYS) {
      throw new BadRequestException('Date range must not exceed 183 days');
    }

    let counter = 0;
    const currentDate = new Date(startDate.getTime());
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
