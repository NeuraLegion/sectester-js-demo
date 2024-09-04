const { default: config } = require('../src/mikro-orm.config');
const isCi = require('is-ci');
const { MikroORM } = require('@mikro-orm/core');

module.exports = async () => {
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
