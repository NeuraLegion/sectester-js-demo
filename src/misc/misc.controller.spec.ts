import { MiscController } from './misc.controller';
import { DateService, FileService, XmlService } from './services';
import { Test, TestingModule } from '@nestjs/testing';
import { RawBodyRequest } from '@nestjs/common';
import { IncomingMessage } from 'http';

describe('MiscController', () => {
  let miscController: MiscController;
  let dateService: jest.Mocked<DateService>;
  let fileService: jest.Mocked<FileService>;
  let xmlService: jest.Mocked<XmlService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MiscController],
      providers: [
        {
          provide: DateService,
          useValue: {
            calculateWeekdays: jest.fn()
          }
        },
        {
          provide: FileService,
          useValue: {
            fetch: jest.fn()
          }
        },
        {
          provide: XmlService,
          useValue: {
            parse: jest.fn()
          }
        }
      ]
    }).compile();

    miscController = module.get<MiscController>(MiscController);
    dateService = module.get(DateService);
    fileService = module.get(FileService);
    xmlService = module.get(XmlService);
  });

  it('should be defined', () => expect(miscController).toBeDefined());

  describe('fetch', () => {
    it('should call fileService fetch() with the provided URL', async () => {
      const url = 'https://example.com';
      const expectedResult = 'fetched content';
      fileService.fetch.mockResolvedValue(expectedResult);

      const result = await miscController.fetch({ url });

      expect(fileService.fetch).toHaveBeenCalledWith(url);
      expect(result).toBe(expectedResult);
    });
  });

  describe('parse', () => {
    it('should call xmlService parse() with the request body', async () => {
      const xmlBody = '<root><child>content</child></root>';
      const expectedResult = 'parsed content';
      xmlService.parse.mockResolvedValue(expectedResult);
      const mockRequest = {
        rawBody: Buffer.from(xmlBody)
      } as RawBodyRequest<IncomingMessage>;

      const result = await miscController.parse(mockRequest);

      expect(xmlService.parse).toHaveBeenCalledWith(xmlBody);
      expect(result).toBe(expectedResult);
    });
  });

  describe('weekdays', () => {
    it('should call dateService calculateWeekdays() and return JSON result', async () => {
      const from = '2023-01-01';
      const to = '2023-12-31';
      const weekday = 1;
      const count = 52;
      dateService.calculateWeekdays.mockResolvedValue(count);

      const result = await miscController.weekdays(
        from,
        to,
        weekday.toString()
      );

      expect(dateService.calculateWeekdays).toHaveBeenCalledWith(
        from,
        to,
        weekday
      );
      expect(result).toEqual({ count });
    });

    it('should use default weekday 1 if not provided', async () => {
      const from = '2023-01-01';
      const to = '2023-12-31';
      const count = 52;
      dateService.calculateWeekdays.mockResolvedValue(count);

      await miscController.weekdays(from, to);

      expect(dateService.calculateWeekdays).toHaveBeenCalledWith(from, to, 1);
    });
  });
});
