import { BadRequestException, Injectable } from '@nestjs/common';

const DATE_RANGE_MAX_DAYS = 31;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseDateOnly(value: string): Date | null {
  if (!DATE_ONLY_PATTERN.test(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return null;
  }

  return parsedDate;
}

@Injectable()
export class DateService {
  public async calculateWeekdays(
    from: string,
    to: string,
    weekDay = 1
  ): Promise<number> {
    const startDate = parseDateOnly(from);
    const endDate = parseDateOnly(to);

    if (!startDate || !endDate) {
      throw new BadRequestException('from and to must be valid dates in YYYY-MM-DD format');
    }

    if (startDate > endDate) {
      throw new BadRequestException('from must be less than or equal to to');
    }

    const rangeLengthInDays =
      Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1;

    if (rangeLengthInDays > DATE_RANGE_MAX_DAYS) {
      throw new BadRequestException(
        `Date range must not exceed ${DATE_RANGE_MAX_DAYS} days`
      );
    }

    if (!Number.isInteger(weekDay) || weekDay < 0 || weekDay > 6) {
      throw new BadRequestException('weekday must be an integer between 0 and 6');
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
