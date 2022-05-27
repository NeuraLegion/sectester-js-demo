import { User } from './users';
import { Logger } from '@nestjs/common';
import { Options } from '@mikro-orm/core';

const logger = new Logger('MikroORM');
const config: Options = {
  port: 3306,
  type: 'mysql',
  dbName: 'test',
  entities: [User],
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  logger: logger.log.bind(logger),
  migrations: {
    snapshot: false,
    pathTs: 'src/migrations',
    path: 'dist/migrations'
  }
};

export default config;
