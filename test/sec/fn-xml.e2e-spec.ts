import { XmlService } from '../../src/misc/services';
import { SecRunner } from '@sectester/runner';
import { TestType } from '@sectester/scan';
import { Test, TestingModule } from '@nestjs/testing';

describe('XmlService', () => {
  jest.setTimeout(600_000);

  let runner!: SecRunner;
  let xmlService!: XmlService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [XmlService]
    }).compile();

    xmlService = moduleRef.get<XmlService>(XmlService);
  });

  beforeEach(async () => {
    if (!process.env.BRIGHT_HOSTNAME) {
      throw new Error('BRIGHT_HOSTNAME is not set');
    }

    runner = new SecRunner({ hostname: process.env.BRIGHT_HOSTNAME });
    await runner.init();
  });

  afterEach(() => runner.clear());

  it('parse() should not have XXE', async () => {
    const inputSample = '<root />';
    const fn = (data: string) => xmlService.parse(data);

    await runner
      .createScan({
        name: expect.getState().currentTestName,
        tests: [TestType.XXE]
      })
      .run({ inputSample, fn });
  });
});
