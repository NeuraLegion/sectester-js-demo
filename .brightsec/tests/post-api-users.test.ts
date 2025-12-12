import { test, before, after } from 'node:test';
import { SecRunner } from '@sectester/runner';
import { AttackParamLocation, HttpMethod } from '@sectester/scan';

const timeout = 40 * 60 * 1000;
const baseUrl = process.env.BRIGHT_TARGET_URL!;

let runner!: SecRunner;

before(async () => {
  runner = new SecRunner({
    hostname: process.env.BRIGHT_HOSTNAME!,
    projectId: process.env.BRIGHT_PROJECT_ID!
  });

  await runner.init();
});

after(() => runner.clear());

test('POST /api/users', { signal: AbortSignal.timeout(timeout) }, async () => {
  await runner
    .createScan({
      tests: ['sqli', 'xss', 'bopla'],
      attackParamLocations: [AttackParamLocation.BODY],
      starMetadata: {
        code_source: "NeuraLegion/sectester-js-demo:master",
        databases: ["SQLite"]
      },
      poolSize: +process.env.SECTESTER_SCAN_POOL_SIZE || undefined
    })
    .setFailFast(false)
    .timeout(timeout)
    .run({
      method: HttpMethod.POST,
      url: `${baseUrl}/api/users`,
      body: {
        firstName: 'John',
        lastName: 'Doe'
      },
      headers: { 'Content-Type': 'application/json' }
    });
});