import { MiscService } from './misc.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('misc')
export class MiscController {
  constructor(private readonly miscService: MiscService) {}

  @Post('/render')
  public render(
    @Body() body: { template: string; params?: Record<string, any> }
  ): Promise<string> {
    return this.miscService.render(body.template, body.params ?? {});
  }

  @Post('/fetch')
  public fetch(@Body() body: { url: string }): Promise<string> {
    return this.miscService.fetch(body.url);
  }
}
