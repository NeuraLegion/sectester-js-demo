const { default: config } = require('../src/mikro-orm.config');
const isCi = require('is-ci');
const dockerCompose = require('docker-compose');
const { MikroORM } = require('@mikro-orm/core');
const { join } = require('path');

module.exports = async () => {
  const cwd = join(__dirname, '..');

  if (isCi) {
    await dockerCompose.down({ cwd });
  } else {
    let orm;
    try {
      orm = await MikroORM.init(config);

      await orm.em.getConnection().execute('delete from "user";');
    } finally {
      await orm?.close();
    }
  }
};
