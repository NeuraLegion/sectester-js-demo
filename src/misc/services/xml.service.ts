import { Injectable } from '@nestjs/common';
import xml2js from 'xml2js';

@Injectable()
export class XmlService {
  public parse(xml: string): Promise<string> {
    const resolved = this.resolveExternalEntities(xml);

    return xml2js.parseStringPromise(resolved);
  }

  private resolveExternalEntities(xml: string): string {
    const entityRegex = /<!ENTITY\s+([^ ]+)\s+SYSTEM\s+"([^"]+)"\s*>/g;
    const entities: Record<string, string> = {};

    let match;
    while ((match = entityRegex.exec(xml)) !== null) {
      const key = match[1];
      const id = match[2];
      if (key && id) {
        entities[key] = this.getExternalEntity(id) || '';
      }
    }

    const entityKeys = Object.keys(entities);
    let xmlWithEntitiesResolved = xml;
    for (const entity of entityKeys) {
      const entityValue = entities[entity];
      const entityRef = new RegExp(`&${entity};`, 'g');
      xmlWithEntitiesResolved = xmlWithEntitiesResolved.replace(
        entityRef,
        entityValue
      );
    }

    return xmlWithEntitiesResolved;
  }

  private getExternalEntity(systemId: string): string | undefined {
    if (systemId.endsWith('/passwd')) {
      return 'root:x:0:0:root:/root:/bin/bash';
    }
  }
}
