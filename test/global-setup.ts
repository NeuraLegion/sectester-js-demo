import { config } from 'dotenv';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { exec } from 'node:child_process';

export default async () => {
  config();

  await promisify(exec)('npm run migration:up', {
    cwd: join(__dirname, '..')
  });
};
