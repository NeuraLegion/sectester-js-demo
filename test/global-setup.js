const detectPort = require('detect-port');
const dockerCompose = require('docker-compose');
const { config } = require('dotenv');
const { join } = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');

module.exports = async () => {
  const port = 5432;
  const freePort = await promisify(detectPort)(port);
  const cwd = join(__dirname, '..');

  config();

  if (freePort === port) {
    await dockerCompose.upAll({
      cwd,
      log: true
    });

    await dockerCompose.exec(
      'postgres',
      ['sh', '-c', 'until pg_isready ; do sleep 1; done'],
      {
        cwd
      }
    );

    await promisify(exec)('npm run migration:up', { cwd });
  }
};
