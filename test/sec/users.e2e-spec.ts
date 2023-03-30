import { UsersModule } from '../../src/users';
import config from '../../src/mikro-orm.config';
import { SecRunner } from '@sectester/runner';
import { AttackParamLocation, Severity, TestType } from '@sectester/scan';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Server } from 'https';

describe('/users', () => {
  const timeout = 600000;
  jest.setTimeout(timeout);

  let runner!: SecRunner;
  let app!: INestApplication;
  let baseUrl!: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        ConfigModule.forRoot(),
        MikroOrmModule.forRoot(config)
      ]
    }).compile();

    app = moduleFixture.createNestApplication(undefined, {
      logger: false
    });
    await app.init();

    const server = app.getHttpServer();

    server.listen(0);

    const port = server.address().port;
    const protocol = app instanceof Server ? 'https' : 'http';
    baseUrl = `${protocol}://localhost:${port}`;
  });

  afterAll(() => app.close());

  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    runner = new SecRunner({ hostname: process.env.BRIGHT_HOSTNAME! });

    await runner.init();
  });

  afterEach(() => runner.clear());

  describe('POST /', () => {
    it('should not have XSS', async () => {
      await runner
        .createScan({
          name: expect.getState().currentTestName,
          tests: [TestType.XSS],
          attackParamLocations: [AttackParamLocation.BODY]
        })
        .threshold(Severity.MEDIUM)
        .timeout(timeout)
        .run({
          method: 'POST',
          url: `${baseUrl}/users`,
          body: { firstName: 'Test', lastName: 'Test' }
        });
    });
  });

  describe('GET /:id', () => {
    it('should not have SQLi', async () => {
      await runner
        .createScan({
          name: expect.getState().currentTestName,
          tests: [TestType.SQLI],
          attackParamLocations: [AttackParamLocation.PATH]
        })
        .threshold(Severity.MEDIUM)
        .timeout(timeout)
        .run({
          method: 'GET',
          url: `${baseUrl}/users/1`
        });
    });
  });
});
