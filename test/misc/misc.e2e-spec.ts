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

  // eslint-disable-next-line jest/no-focused-tests
  it.only('calculateWeekdays() should not have DATE_MANIPULATION', async () => {
    type FnArgs = {
      from: string;
      to: string;
    };
    const inputSample: FnArgs = {
      from: '2022-11-30',
      to: '2024-06-21'
    };
    const fn = ({ from, to }: FnArgs) =>
      miscService.calculateWeekdays(from, to);

    await runner
      .createScan({
        name: expect.getState().currentTestName,
        tests: [TestType.DATE_MANIPULATION]
      })
      .run({ inputSample, fn });
  });
});
