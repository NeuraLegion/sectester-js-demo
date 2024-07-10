import { XmlService } from './xml.service';
import { Injectable } from '@nestjs/common';
import { render } from 'ejs';

@Injectable()
export class MiscService {
  constructor(private readonly xmlService: XmlService) {}

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

  public parse(xml: string): Promise<any> {
    return this.xmlService.parse(xml);
  }
}
