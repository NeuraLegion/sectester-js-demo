import { JwtPayloadService } from '../../src/misc/services';
import { SecRunner } from '@sectester/runner';
import { AttackParamLocation, TestType } from '@sectester/scan';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';

interface JwtFnPayload {
  readonly jwt: string;
  readonly payload: Record<string, any>;
}

describe('JwtPayloadService', () => {
  const timeout = 600000;
  jest.setTimeout(timeout);

  let runner!: SecRunner;
  let jwtPayloadService!: JwtPayloadService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'some_secret'
        })
      ],
      providers: [JwtPayloadService]
    }).compile();

    jwtPayloadService = moduleRef.get<JwtPayloadService>(JwtPayloadService);
  });

  beforeEach(async () => {
    if (!process.env.BRIGHT_HOSTNAME) {
      throw new Error('BRIGHT_HOSTNAME is not set');
    }

    runner = new SecRunner({ hostname: process.env.BRIGHT_HOSTNAME });
    await runner.init();
  });

  afterEach(() => runner?.clear());

  const SAMPLE_JWT_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9uIiwiaWF0IjoxNzIwNjAxMjEwLCJleHAiOjE3MjA2MDE4MTB9.L5aDVSPIPgDnCoHezIUlgKen3eSSLn22rpoAWjGCQrA';

  it('update() should not have JWT issues', async () => {
    const payloadSample = JSON.stringify({
      jwt: SAMPLE_JWT_TOKEN,
      payload: {
        name: 'John'
      }
    } as JwtFnPayload);
    const fn = (data: string): Promise<any> => {
      const parsed = JSON.parse(data) as JwtFnPayload;

      return Promise.resolve({
        jwt: jwtPayloadService.update(parsed.jwt, parsed.payload)
      });
    };

    await runner
      .createScan({
        name: expect.getState().currentTestName,
        tests: [TestType.JWT],
        attackParamLocations: [AttackParamLocation.BODY]
      })
      .timeout(timeout)
      .runPayloadScan(payloadSample, fn);
  });

  // eslint-disable-next-line jest/no-focused-tests
  it.only('verify() should not have JWT issues', async () => {
    const payloadSample = JSON.stringify({
      token: SAMPLE_JWT_TOKEN
    });
    const fn = (data: string): Promise<any> => {
      const parsed = JSON.parse(data) as { token: string };

      return Promise.resolve({
        valid: jwtPayloadService.verify(parsed.token)
      });
    };

    await runner
      .createScan({
        name: expect.getState().currentTestName,
        tests: [TestType.JWT],
        attackParamLocations: [AttackParamLocation.BODY]
      })
      .timeout(timeout)
      .runPayloadScan(payloadSample, fn);
  });

  it('decode() should not have JWT issues', async () => {
    const payloadSample = JSON.stringify({
      jwtToken: SAMPLE_JWT_TOKEN
    });
    const fn = (data: string): Promise<any> => {
      const parsed = JSON.parse(data) as { jwtToken: string };

      return Promise.resolve(jwtPayloadService.decode(parsed.jwtToken));
    };

    await runner
      .createScan({
        name: expect.getState().currentTestName,
        tests: [TestType.JWT],
        attackParamLocations: [AttackParamLocation.BODY]
      })
      .timeout(timeout)
      .runPayloadScan(payloadSample, fn);
  });
});
