import { MiscService } from '../../src/misc/misc.service';
import { SecRunner } from '@sectester/runner';
import { AttackParamLocation, Severity, TestType } from '@sectester/scan';
import { Test, TestingModule } from '@nestjs/testing';

describe('MiscService', () => {
  const timeout = 600000;
  jest.setTimeout(timeout);

  let runner!: SecRunner;
  let miscService!: MiscService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [MiscService]
    }).compile();

    miscService = moduleRef.get<MiscService>(MiscService);
  });

  beforeEach(async () => {
    if (!process.env.BRIGHT_HOSTNAME) {
      throw new Error('BRIGHT_HOSTNAME is not set');
    }

    runner = new SecRunner({ hostname: process.env.BRIGHT_HOSTNAME });
    await runner.init();
  });

  afterEach(() => runner.clear());

  it('render() should not have SSTI', async () => {
    const payloadSample = JSON.stringify({ template: 'Hello!' });
    const fn = async (data: string): Promise<string> => {
      const template =
        (JSON.parse(data) as { template: string }).template || '';
      const result = await miscService.render(template, {});

      return result;
    };

    await runner
      .createScan({
        name: expect.getState().currentTestName,
        tests: [TestType.SSTI],
        attackParamLocations: [AttackParamLocation.BODY]
      })
      .threshold(Severity.LOW)
      .timeout(timeout)
      .runPayloadScan(payloadSample, fn);
  });

  it('fetch() should not have RFI', async () => {
    const payloadSample = JSON.stringify({
      url: 'https://brightsec.com/robots.txt'
    });
    const fn = async (data: string): Promise<string> => {
      const url = (JSON.parse(data) as { url: string }).url;
      const result = await miscService.fetch(url);

      return result;
    };

    await runner
      .createScan({
        name: expect.getState().currentTestName,
        tests: [TestType.RFI],
        attackParamLocations: [AttackParamLocation.BODY]
      })
      .threshold(Severity.LOW)
      .timeout(timeout)
      .runPayloadScan(payloadSample, fn);
  });
});
