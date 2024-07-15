import { DateService } from './date.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('DateService', () => {
  let service: DateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DateService]
    }).compile();

    service = module.get<DateService>(DateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateWeekdays', () => {
    it('should calculate weekdays correctly', async () => {
      const result = await service.calculateWeekdays(
        '2024-07-15',
        '2024-07-15',
        1
      );

      expect(result).toBe(1);
    });

    it('should handle different weekdays', async () => {
      const result = await service.calculateWeekdays(
        '2024-07-14',
        '2024-07-15',
        0
      );

      expect(result).toBe(1);
    });

    it('should use default weekday if not provided', async () => {
      const result = await service.calculateWeekdays(
        '2024-07-01',
        '2024-07-31'
      );

      expect(result).toBe(5);
    });

    it('should handle common years correctly', async () => {
      const result = await service.calculateWeekdays(
        '2023-01-01',
        '2023-12-31',
        3
      );

      expect(result).toBe(52);
    });

    it('should handle leap years correctly', async () => {
      const result = await service.calculateWeekdays(
        '2024-01-01',
        '2024-12-31',
        2
      );

      expect(result).toBe(53);
    });

    it('should return 0 if end date is before start date', async () => {
      const result = await service.calculateWeekdays(
        '2023-07-31',
        '2023-07-01',
        1
      );

      expect(result).toBe(0);
    });
  });
});
