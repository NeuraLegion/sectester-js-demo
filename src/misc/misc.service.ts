import { Injectable } from '@nestjs/common';
import { render } from 'ejs';

@Injectable()
export class MiscService {
  public render(
    template: string,
    params: Record<string, any>
  ): Promise<string> {
    return Promise.resolve(render(template, params));
  }

  public async fetch(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching "${url}", status: ${response.status}`);
    }

    return response.text();
  }

  public async calculateWeekdays(
    from: string,
    to: string,
    weekDay = 1
  ): Promise<number> {
    const startDate = new Date(from);
    const endDate = new Date(to);

    let mondaysCounter = 0;
    const currentDate = startDate;
    while (currentDate <= endDate) {
      if (currentDate.getDay() === weekDay) {
        mondaysCounter++;
      }

      if (mondaysCounter % 100 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return mondaysCounter;
  }
}
