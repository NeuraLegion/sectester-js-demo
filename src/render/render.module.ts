import { RenderService } from './render.service';
import { RenderController } from './render.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  providers: [RenderService],
  controllers: [RenderController]
})
export class RenderModule {}
