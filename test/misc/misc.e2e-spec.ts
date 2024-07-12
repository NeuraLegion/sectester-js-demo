import { MiscModule } from '../../src/misc/misc.module';
import { MiscService } from '../../src/misc/misc.service';
import { SecRunner } from '@sectester/runner';
import { TestType } from '@sectester/scan';
import { Test, TestingModule } from '@nestjs/testing';

describe('MiscService', () => {
  jest.setTimeout(600_000);

  let runner!: SecRunner;
  let miscService!: MiscService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [MiscModule]
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
    type FnArgs = {
      template: string;
    };
    const inputSample: FnArgs = { template: 'some string' };
    const fn = ({ template }: FnArgs) => miscService.render(template, {});

    await runner
      .createScan({
        name: expect.getState().currentTestName,
        tests: [TestType.SSTI]
      })
      .run({ inputSample, fn });
  });

  it('fetch() should not have RFI', async () => {
    type FnArgs = {
      url: string;
    };
    const inputSample: FnArgs = {
      url: 'https://brightsec.com/robots.txt'
    };
    const fn = ({ url }: FnArgs) => miscService.fetch(url);

    await runner
      .createScan({
        name: expect.getState().currentTestName,
        tests: [TestType.RFI]
      })
      .run({ inputSample, fn });
  });
});
