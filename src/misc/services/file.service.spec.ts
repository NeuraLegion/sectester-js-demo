import { FileService } from './file.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('FileService', () => {
  let service: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileService]
    }).compile();

    service = module.get<FileService>(FileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetch', () => {
    let fetchMock: jest.Mock;

    beforeEach(() => {
      fetchMock = jest.fn();
      global.fetch = fetchMock;
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should fetch content successfully', async () => {
      const url = 'https://example.com';
      const expectedContent = 'Sample content';
      fetchMock.mockResolvedValue({
        ok: true,
        url,
        text: jest.fn().mockResolvedValue(expectedContent)
      });

      const result = await service.fetch(url);

      expect(fetchMock).toHaveBeenCalledWith(url, { redirect: 'error' });
      expect(result).toBe(expectedContent);
    });

    it('should throw an error when fetch fails', async () => {
      const url = 'https://example.com';
      const status = 404;
      fetchMock.mockResolvedValue({
        ok: false,
        url,
        status
      });

      const result = service.fetch(url);

      await expect(result).rejects.toThrow(
        `Error fetching "${url}", status: ${status}`
      );
      expect(fetchMock).toHaveBeenCalledWith(url, { redirect: 'error' });
    });

    it('should throw an error when network request fails', async () => {
      const url = 'https://example.com';
      const errorMessage = 'Network error';
      fetchMock.mockRejectedValue(new Error(errorMessage));

      const result = service.fetch(url);

      await expect(result).rejects.toThrow(errorMessage);
      expect(fetchMock).toHaveBeenCalledWith(url, { redirect: 'error' });
    });

    it('should reject URLs outside the HTTPS allowlist', async () => {
      await expect(
        service.fetch('http://filedealer.nexploit.app/rfi.md5.txt')
      ).rejects.toThrow('Only HTTPS URLs from approved hosts are allowed');

      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
