import { MiscModule } from '../../src/misc/misc.module';
import { DateService } from '../../src/misc/services';
import { SecRunner } from '@sectester/runner';
import { TestType } from '@sectester/scan';
import { Test, TestingModule } from '@nestjs/testing';

describe('DateService', () => {
  jest.setTimeout(600_000);

  let runner!: SecRunner;
  let dateService!: DateService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [MiscModule]
    }).compile();

    dateService = moduleRef.get<DateService>(DateService);
  });

  beforeEach(async () => {
    if (!process.env.BRIGHT_HOSTNAME) {
      throw new Error('BRIGHT_HOSTNAME is not set');
    }

    runner = new SecRunner({ hostname: process.env.BRIGHT_HOSTNAME });
    await runner.init();
  });

  afterEach(() => runner.clear());

  describe('calculateWeekdays', () => {
    it('should not have DATE_MANIPULATION', async () => {
      type FnArgs = {
        from: string;
        to: string;
      };
      const inputSample: FnArgs = {
        from: '2022-11-30',
        to: '2024-06-21'
      };
      const fn = ({ from, to }: FnArgs) =>
        dateService.calculateWeekdays(from, to);

      await runner
        .createScan({
          name: expect.getState().currentTestName,
          tests: [TestType.DATE_MANIPULATION]
        })
        .run({ inputSample, fn });
    });
  });
});
