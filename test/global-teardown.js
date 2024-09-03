const { default: config } = require('../src/mikro-orm.config');
const isCi = require('is-ci');
const { MikroORM } = require('@mikro-orm/core');
const { join } = require('path');

module.exports = async () => {
  const cwd = join(__dirname, '..');

  if (!isCi) {
    let orm;
    try {
      orm = await MikroORM.init(config);

      await orm.em
        .getConnection()
        .execute('delete from "user" where "id" != 1;');
    } finally {
      await orm?.close();
    }
  }
};
