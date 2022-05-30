import {
  MikroOrmModuleOptions,
  MikroOrmOptionsFactory
} from '@mikro-orm/nestjs';
import { IDatabaseDriver } from '@mikro-orm/core';
import { ConfigModule } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MikroOrmConfigFactory implements MikroOrmOptionsFactory {
  public async createMikroOrmOptions(): Promise<
    MikroOrmModuleOptions<IDatabaseDriver>
  > {
    await ConfigModule.envVariablesLoaded;

    return {
      ...(await import('../mikro-orm.config')).default
    };
  }
}
