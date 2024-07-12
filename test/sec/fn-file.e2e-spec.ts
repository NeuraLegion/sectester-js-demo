import { MiscModule } from '../../src/misc/misc.module';
import { FileService } from '../../src/misc/services';
import { SecRunner } from '@sectester/runner';
import { TestType } from '@sectester/scan';
import { Test, TestingModule } from '@nestjs/testing';

describe('FileService', () => {
  jest.setTimeout(600_000);

  let runner!: SecRunner;
  let fileService!: FileService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [MiscModule]
    }).compile();

    fileService = moduleRef.get<FileService>(FileService);
  });

  beforeEach(async () => {
    if (!process.env.BRIGHT_HOSTNAME) {
      throw new Error('BRIGHT_HOSTNAME is not set');
    }

    runner = new SecRunner({ hostname: process.env.BRIGHT_HOSTNAME });
    await runner.init();
  });

  afterEach(() => runner.clear());

  it('fetch() should not have RFI', async () => {
    type FnArgs = {
      url: string;
    };
    const inputSample: FnArgs = {
      url: 'https://brightsec.com/robots.txt'
    };
    const fn = ({ url }: FnArgs) => fileService.fetch(url);

    await runner
      .createScan({
        name: expect.getState().currentTestName,
        tests: [TestType.RFI]
      })
      .run({ inputSample, fn });
  });
});
