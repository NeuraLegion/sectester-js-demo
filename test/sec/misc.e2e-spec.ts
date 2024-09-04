import { MiscModule } from '../../src/misc';
import config from '../../src/mikro-orm.config';
import { SecRunner } from '@sectester/runner';
import { AttackParamLocation, Severity, TestType } from '@sectester/scan';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Server } from 'https';

describe('/misc', () => {
  const timeout = 600000;
  jest.setTimeout(timeout);

  let runner!: SecRunner;
  let app!: INestApplication;
  let baseUrl!: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MiscModule,
        ConfigModule.forRoot(),
        MikroOrmModule.forRoot(config)
      ]
    }).compile();

    app = moduleFixture.createNestApplication({
      logger: false
    });
    await app.init();

    const server = app.getHttpServer();

    server.listen(0);

    const port = server.address().port;
    const protocol = server instanceof Server ? 'https' : 'http';
    baseUrl = `${protocol}://localhost:${port}`;
  });

  afterAll(() => app.close());

  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    runner = new SecRunner({ hostname: process.env.BRIGHT_HOSTNAME! });

    await runner.init();
  });

  afterEach(() => runner.clear());

  describe('GET /weekdays', () => {
    it('should not have DATE_MANIPULATION vulnerability', async () => {
      await runner
        .createScan({
          name: expect.getState().currentTestName,
          tests: [TestType.DATE_MANIPULATION],
          attackParamLocations: [AttackParamLocation.QUERY]
        })
        .threshold(Severity.MEDIUM)
        .timeout(timeout)
        .run({
          method: 'GET',
          url: `${baseUrl}/misc/weekdays?from=2020-08-08&to=2024-09-04&weekDay=5`
        });
    });
  });

  describe('POST /fetch', () => {
    it('should not have RFI vulnerability', async () => {
      await runner
        .createScan({
          name: expect.getState().currentTestName,
          tests: [TestType.RFI],
          attackParamLocations: [AttackParamLocation.BODY]
        })
        .threshold(Severity.MEDIUM)
        .timeout(timeout)
        .run({
          method: 'POST',
          url: `${baseUrl}/misc/fetch`,
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            url: 'https://brokencrystals.com/config.js'
          })
        });
    });
  });

  describe('POST /xml', () => {
    it('should not have XXE vulnerability', async () => {
      await runner
        .createScan({
          name: expect.getState().currentTestName,
          tests: [TestType.XXE],
          attackParamLocations: [AttackParamLocation.BODY]
        })
        .threshold(Severity.MEDIUM)
        .timeout(timeout)
        .run({
          method: 'POST',
          url: `${baseUrl}/misc/xml`,
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'content-type': 'application/xml'
          },
          body: '<?xml version="1.0" encoding="UTF-8"?>\n<foo>bar</foo>'
        });
    });
  });
});
