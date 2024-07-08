import { Injectable } from '@nestjs/common';
import { render } from 'ejs';

@Injectable()
export class RenderService {
  public render(
    template: string,
    params: Record<string, any>
  ): Promise<string> {
    return Promise.resolve(render(template, params));
  }
}
