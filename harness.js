const express = require('express');

const app = express();
app.use(express.text({ type: '*/*', limit: '10mb' }));

function setPlain(res) {
  res.type('text/plain');
}

function safeStringify(value) {
  if (typeof value === 'string') {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch (e) {
    return String(value);
  }
}

function tryLoad(name, loader) {
  try {
    const loaded = loader();
    console.log(`[harness] loaded ${name}`);
    return loaded;
  } catch (err) {
    console.warn(
      `[harness] failed to load ${name}: ${err && err.message ? err.message : String(err)}`
    );
    return null;
  }
}

const xmlModule = tryLoad('XmlService', () => require('./src/misc/services/xml.service'));
const dateModule = tryLoad('DateService', () => require('./src/misc/services/date.service'));

const xmlService =
  xmlModule && xmlModule.XmlService ? new xmlModule.XmlService() : null;
const dateService =
  dateModule && dateModule.DateService ? new dateModule.DateService() : null;

app.get('/health', (_req, res) => {
  setPlain(res);
  res.status(200).send('ok');
});

if (xmlService) {
  app.post('/harness/xmlservice-parse', async (req, res) => {
    setPlain(res);
    try {
      const xml =
        typeof req.body === 'string'
          ? req.body
          : req.body && typeof req.body.xml === 'string'
            ? req.body.xml
            : typeof req.query.xml === 'string'
              ? req.query.xml
              : '';

      const result = await xmlService.parse(xml);
      res.status(200).send(safeStringify(result));
    } catch (err) {
      res
        .status(500)
        .send(err && err.message ? err.message : String(err));
    }
  });

  app.post('/harness/xmlservice-resolveexternalentities', async (req, res) => {
    setPlain(res);
    try {
      const xml =
        typeof req.body === 'string'
          ? req.body
          : req.body && typeof req.body.xml === 'string'
            ? req.body.xml
            : typeof req.query.xml === 'string'
              ? req.query.xml
              : '';

      const result = xmlService.resolveExternalEntities(xml);
      res.status(200).send(safeStringify(result));
    } catch (err) {
      res
        .status(500)
        .send(err && err.message ? err.message : String(err));
    }
  });

  app.post('/harness/xmlservice-getexternalentity', async (req, res) => {
    setPlain(res);
    try {
      const systemId =
        typeof req.body === 'string'
          ? req.body
          : req.body && typeof req.body.systemId === 'string'
            ? req.body.systemId
            : typeof req.query.systemId === 'string'
              ? req.query.systemId
              : '';

      const result = xmlService.getExternalEntity(systemId);
      res.status(200).send(safeStringify(result));
    } catch (err) {
      res
        .status(500)
        .send(err && err.message ? err.message : String(err));
    }
  });
} else {
  console.warn('[harness] skipping XmlService routes');
}

if (dateService) {
  app.get('/harness/dateservice-calculateweekdays', async (req, res) => {
    setPlain(res);
    try {
      const from =
        typeof req.query.from === 'string' ? req.query.from : '';
      const to =
        typeof req.query.to === 'string' ? req.query.to : '';
      const weekDayRaw = req.query.weekDay;
      const weekDay =
        typeof weekDayRaw === 'string' ? Number(weekDayRaw) : Number(weekDayRaw);

      const result = await dateService.calculateWeekdays(from, to, weekDay);
      res.status(200).send(safeStringify(result));
    } catch (err) {
      res
        .status(500)
        .send(err && err.message ? err.message : String(err));
    }
  });
} else {
  console.warn('[harness] skipping DateService routes');
}

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`[harness] listening on ${port}`);
});
