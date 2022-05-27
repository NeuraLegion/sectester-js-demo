import { UsersModule } from './users';
import config from './mikro-orm.config';
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [UsersModule, ConfigModule.forRoot(), MikroOrmModule.forRoot(config)]
})
export class AppModule {}
