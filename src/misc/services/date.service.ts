import { BadRequestException, Injectable } from '@nestjs/common';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MAX_WEEKDAYS_RANGE_DAYS = 31;

const parseIsoDate = (value: string): Date | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
};

@Injectable()
export class DateService {
  public async calculateWeekdays(
    from: string,
    to: string,
    weekDay = 1
  ): Promise<number> {
    const startDate = parseIsoDate(from);
    const endDate = parseIsoDate(to);

    if (!startDate || !endDate) {
      throw new BadRequestException('Dates must use the YYYY-MM-DD format');
    }

    if (!Number.isInteger(weekDay) || weekDay < 0 || weekDay > 6) {
      throw new BadRequestException('Weekday must be an integer between 0 and 6');
    }

    if (startDate > endDate) {
      throw new BadRequestException('The "from" date must be before or equal to "to"');
    }

    const totalDays =
      Math.floor((endDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;

    if (totalDays > MAX_WEEKDAYS_RANGE_DAYS) {
      throw new BadRequestException(
        `Date range must not exceed ${MAX_WEEKDAYS_RANGE_DAYS} days`
      );
    }

    const fullWeeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;
    let counter = fullWeeks;
    const startWeekDay = startDate.getUTCDay();

    for (let dayOffset = 0; dayOffset < remainingDays; dayOffset += 1) {
      if ((startWeekDay + dayOffset) % 7 === weekDay) {
        counter++;
      }
    }

    return counter;
  }
}
