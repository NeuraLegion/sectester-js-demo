import { MiscService } from './misc.service';
import { MiscController } from './misc.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  providers: [MiscService],
  controllers: [MiscController]
})
export class MiscModule {}
