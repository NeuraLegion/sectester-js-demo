import { MiscService } from './misc.service';
import { MiscController } from './misc.controller';
import { DateService, XmlService } from './services';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  providers: [DateService, MiscService, XmlService],
  controllers: [MiscController]
})
export class MiscModule {}
