const express = require('express');

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(express.text({ type: '*/*', limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '1mb' }));

function sendPlain(res, status, body) {
  res.status(status);
  res.type('text/plain');
  res.send(typeof body === 'string' ? body : String(body));
}

function serializeResult(result) {
  if (typeof result === 'string') return result;
  if (result === undefined) return 'undefined';
  if (result === null) return 'null';
  if (typeof result === 'object') {
    try {
      return JSON.stringify(result);
    } catch (e) {
      return String(result);
    }
  }
  return String(result);
}

function loadClass(possiblePaths, className) {
  for (const p of possiblePaths) {
    try {
      const mod = require(p);
      const Cls = mod && (mod[className] || (mod.default && mod.default[className]) || mod.default);
      if (Cls) {
        return { Cls, path: p };
      }
      console.warn(`[harness] Module loaded but class ${className} not found in ${p}`);
    } catch (err) {
      console.warn(`[harness] Failed to load ${className} from ${p}: ${err.message}`);
    }
  }
  return null;
}

const loaded = {
  xmlService: null,
  dateService: null,
};

const xmlLoad = loadClass(
  [
    '/app/dist/misc/services/xml.service.js',
    '/app/src/misc/services/xml.service.ts',
    './dist/misc/services/xml.service.js',
    './src/misc/services/xml.service.ts',
  ],
  'XmlService'
);

if (xmlLoad) {
  try {
    loaded.xmlService = new xmlLoad.Cls();
    console.log(`[harness] Loaded XmlService from ${xmlLoad.path}`);
  } catch (err) {
    console.warn(`[harness] Failed to instantiate XmlService: ${err.message}`);
  }
}

const dateLoad = loadClass(
  [
    '/app/dist/misc/services/date.service.js',
    '/app/src/misc/services/date.service.ts',
    './dist/misc/services/date.service.js',
    './src/misc/services/date.service.ts',
  ],
  'DateService'
);

if (dateLoad) {
  try {
    loaded.dateService = new dateLoad.Cls();
    console.log(`[harness] Loaded DateService from ${dateLoad.path}`);
  } catch (err) {
    console.warn(`[harness] Failed to instantiate DateService: ${err.message}`);
  }
}

app.get('/health', (_req, res) => {
  sendPlain(res, 200, 'ok');
});

app.post('/harness/xmlservice-parse', async (req, res) => {
  if (!loaded.xmlService || typeof loaded.xmlService.parse !== 'function') {
    return sendPlain(res, 503, 'XmlService.parse not available');
  }

  try {
    const xml =
      typeof req.body === 'string'
        ? req.body
        : req.body && typeof req.body.xml === 'string'
          ? req.body.xml
          : '';

    const result = await loaded.xmlService.parse(xml);
    return sendPlain(res, 200, serializeResult(result));
  } catch (err) {
    return sendPlain(res, 500, err && err.message ? err.message : String(err));
  }
});

app.post('/harness/xmlservice-resolveexternalentities', async (req, res) => {
  if (!loaded.xmlService || typeof loaded.xmlService.resolveExternalEntities !== 'function') {
    return sendPlain(res, 503, 'XmlService.resolveExternalEntities not available');
  }

  try {
    const xml =
      typeof req.body === 'string'
        ? req.body
        : req.body && typeof req.body.xml === 'string'
          ? req.body.xml
          : '';

    const result = await loaded.xmlService.resolveExternalEntities(xml);
    return sendPlain(res, 200, serializeResult(result));
  } catch (err) {
    return sendPlain(res, 500, err && err.message ? err.message : String(err));
  }
});

app.post('/harness/xmlservice-getexternalentity', async (req, res) => {
  if (!loaded.xmlService || typeof loaded.xmlService.getExternalEntity !== 'function') {
    return sendPlain(res, 503, 'XmlService.getExternalEntity not available');
  }

  try {
    const systemId =
      typeof req.body === 'string'
        ? req.body
        : req.body && typeof req.body.systemId === 'string'
          ? req.body.systemId
          : '';

    const result = await loaded.xmlService.getExternalEntity(systemId);
    return sendPlain(res, 200, serializeResult(result));
  } catch (err) {
    return sendPlain(res, 500, err && err.message ? err.message : String(err));
  }
});

app.get('/harness/dateservice-calculateweekdays', async (req, res) => {
  if (!loaded.dateService || typeof loaded.dateService.calculateWeekdays !== 'function') {
    return sendPlain(res, 503, 'DateService.calculateWeekdays not available');
  }

  try {
    const from = typeof req.query.from === 'string' ? req.query.from : '';
    const to = typeof req.query.to === 'string' ? req.query.to : '';
    const weekDay =
      req.query.weekDay !== undefined ? Number(req.query.weekDay) : 1;

    const result = await loaded.dateService.calculateWeekdays(from, to, weekDay);
    return sendPlain(res, 200, serializeResult(result));
  } catch (err) {
    return sendPlain(res, 500, err && err.message ? err.message : String(err));
  }
});

app.listen(PORT, () => {
  console.log(`[harness] listening on port ${PORT}`);
});
