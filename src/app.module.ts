import { UsersModule } from './users';
import { MikroOrmConfigFactory } from './config';
import { MiscModule } from './misc';
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    UsersModule,
    MiscModule,
    MikroOrmModule.forRootAsync({
      useClass: MikroOrmConfigFactory
    })
  ]
})
export class AppModule {}
