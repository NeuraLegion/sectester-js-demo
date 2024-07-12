import { JwtPayloadService } from '../../src/misc/services';
import { SecRunner } from '@sectester/runner';
import { TestType } from '@sectester/scan';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';

describe('JwtPayloadService', () => {
  jest.setTimeout(600_000);

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
    type FnArgs = {
      jwt: string;
      payload: Record<string, any>;
    };
    const inputSample: FnArgs = {
      jwt: SAMPLE_JWT_TOKEN,
      payload: {
        name: 'John'
      }
    };
    const fn = ({ jwt, payload }: FnArgs) =>
      Promise.resolve({
        jwt: jwtPayloadService.update(jwt, payload)
      });

    await runner
      .createScan({
        name: expect.getState().currentTestName,
        tests: [TestType.JWT]
      })
      .run({ inputSample, fn });
  });

  it('verify() should not have JWT issues', async () => {
    type FnArgs = {
      token: string;
    };
    const inputSample: FnArgs = {
      token: SAMPLE_JWT_TOKEN
    };
    const fn = ({ token }: FnArgs) =>
      Promise.resolve({
        valid: jwtPayloadService.verify(token)
      });

    await runner
      .createScan({
        name: expect.getState().currentTestName,
        tests: [TestType.JWT]
      })
      .run({ inputSample, fn });
  });

  it('decode() should not have JWT issues', async () => {
    type FnArgs = {
      jwtToken: string;
    };
    const inputSample: FnArgs = {
      jwtToken: SAMPLE_JWT_TOKEN
    };
    const fn = ({ jwtToken }: FnArgs) =>
      Promise.resolve(jwtPayloadService.decode(jwtToken));

    await runner
      .createScan({
        name: expect.getState().currentTestName,
        tests: [TestType.JWT]
      })
      .run({ inputSample, fn });
  });
});
