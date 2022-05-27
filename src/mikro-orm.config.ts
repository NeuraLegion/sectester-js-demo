import { User } from './users';
import { Logger } from '@nestjs/common';
import { Options } from '@mikro-orm/core';

const logger = new Logger('MikroORM');
const config: Options = {
  port: 5432,
  type: 'postgresql',
  dbName: 'test',
  entities: [User],
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  logger: logger.log.bind(logger),
  migrations: {
    snapshot: false,
    pathTs: 'src/migrations',
    path: 'dist/migrations'
  }
};

export default config;
