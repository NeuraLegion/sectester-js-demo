import { UsersModule } from './users';
import { MikroOrmConfigFactory } from './config';
import { MiscModule } from './misc';
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    MiscModule,
    ConfigModule.forRoot(),
    MikroOrmModule.forRootAsync({
      useClass: MikroOrmConfigFactory
    })
  ]
})
export class AppModule {}
