import { RenderService } from '../../src/render/render.service';
import { SecRunner } from '@sectester/runner';
import { AttackParamLocation, Severity, TestType } from '@sectester/scan';
import { Test, TestingModule } from '@nestjs/testing';

/* eslint-disable no-console */

describe('RenderService', () => {
  const timeout = 600000;
  jest.setTimeout(timeout);

  let runner!: SecRunner;
  let fut!: (data: unknown) => Promise<string>;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [RenderService]
    }).compile();

    const renderService = moduleRef.get<RenderService>(RenderService);

    fut = async (data: unknown): Promise<string> => {
      const template =
        typeof data === 'string'
          ? (JSON.parse(data) as { template?: string }).template || ''
          : '';
      const result = await renderService.render(template, {});

      return result;
    };
  });

  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    runner = new SecRunner({ hostname: process.env.BRIGHT_HOSTNAME! });

    await runner.init();
  });

  afterEach(() => runner.clear());

  describe('render', () => {
    it('should not have SSTI', async () => {
      await runner
        .createScan({
          name: expect.getState().currentTestName,
          tests: [TestType.SSTI],
          attackParamLocations: [AttackParamLocation.BODY]
        })
        .threshold(Severity.LOW)
        .timeout(timeout)
        .runPayloadScan(JSON.stringify({ template: 'Hello!' }), fut);
    });
  });
});
