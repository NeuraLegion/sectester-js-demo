import { RenderService } from './render.service';
import { Body, Controller, Post } from '@nestjs/common';

interface RenderData {
  readonly template: string;
  readonly params: Record<string, any>;
}

@Controller('render')
export class RenderController {
  constructor(private readonly renderService: RenderService) {}

  @Post()
  public create(@Body() body: RenderData): Promise<string> {
    return this.renderService.render(body?.template || '', body?.params ?? {});
  }
}
