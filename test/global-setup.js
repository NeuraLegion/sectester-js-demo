const { config } = require('dotenv');
const { join } = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');

module.exports = async () => {
  config();

  await promisify(exec)('npm run migration:up', {
    cwd: join(__dirname, '..'),
    stdio: 'inherit'
  });
};
