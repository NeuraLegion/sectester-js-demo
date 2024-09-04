import config from '../src/mikro-orm.config';
import isCi from 'is-ci';
import { MikroORM } from '@mikro-orm/core';

export default async () => {
  if (isCi) {
    return;
  }

  let orm;
  try {
    orm = await MikroORM.init(config);

    await orm.em.getConnection().execute('delete from "user" where "id" > 5;');
  } finally {
    await orm?.close();
  }
};
