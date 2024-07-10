import { MiscService } from './misc.service';
import { MiscController } from './misc.controller';
import { XmlService } from './xml.service';
import { JwtPayloadService } from './services';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '600s' }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [MiscService, JwtPayloadService, XmlService],
  controllers: [MiscController]
})
export class MiscModule {}
