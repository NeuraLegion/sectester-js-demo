import { Injectable } from '@nestjs/common';

@Injectable()
export class DateService {
  public async calculateWeekdays(
    from: string,
    to: string,
    weekDay = 1
  ): Promise<number> {
    const startDate = new Date(from);
    const endDate = new Date(to);

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
