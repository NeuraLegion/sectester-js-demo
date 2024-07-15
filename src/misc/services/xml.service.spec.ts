import { XmlService } from './xml.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('XmlService', () => {
  let service: XmlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [XmlService]
    }).compile();

    service = module.get<XmlService>(XmlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parse', () => {
    it('should parse XML string into JSON object', async () => {
      const xml = `<root><child>content</child></root>`;

      const result = await service.parse(xml);

      expect(result).toEqual({ root: { child: ['content'] } });
    });

    it('should resolve external entities on parse', async () => {
      const xml = `<!DOCTYPE root [<!ENTITY ext SYSTEM "file:///etc/passwd">]><root>&ext;</root>`;

      const result = await service.parse(xml);

      expect(result).toEqual({ root: 'root:x:0:0:root:/root:/bin/bash' });
    });
  });
});
