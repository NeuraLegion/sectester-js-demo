const detectPort = require('detect-port');
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
    await promisify(exec)('npm run migration:up', { cwd });
  }
};
