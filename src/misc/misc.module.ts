import { MiscController } from './misc.controller';
import { DateService, FileService, XmlService } from './services';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  providers: [DateService, FileService, XmlService],
  controllers: [MiscController]
})
export class MiscModule {}
