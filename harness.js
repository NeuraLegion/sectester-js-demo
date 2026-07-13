#!/usr/bin/env node

/**
 * Lightweight HTTP harness for selected service methods.
 *
 * Targets:
 * - POST /harness/xmlservice-parse
 * - POST /harness/xmlservice-resolveexternalentities
 * - POST /harness/xmlservice-getexternalentity
 * - GET  /harness/dateservice-calculateweekdays
 * - GET  /health
 *
 * Design goals:
 * - Minimal bootstrapping, no Nest app startup.
 * - Read source files first to understand constructors/deps.
 * - Prefer loading project source via ts-node when available.
 * - Otherwise discover/load built artifacts without assuming output dir.
 * - If a target fails to load, skip it and continue serving others.
 * - Return text/plain from harness endpoints.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const PORT = Number(process.env.PORT || 3001);
const ROOT = process.cwd();

const TARGETS = [
  {
    key: 'xml.parse',
    route: '/harness/xmlservice-parse',
    method: 'POST',
    sourcePath: 'src/misc/services/xml.service.ts',
    className: 'XmlService',
    symbolCheck: 'parse',
    handlerName: 'parse',
    internal: false,
  },
  {
    key: 'xml.resolveExternalEntities',
    route: '/harness/xmlservice-resolveexternalentities',
    method: 'POST',
    sourcePath: 'src/misc/services/xml.service.ts',
    className: 'XmlService',
    symbolCheck: 'resolveExternalEntities',
    handlerName: 'resolveExternalEntities',
    internal: true,
  },
  {
    key: 'xml.getExternalEntity',
    route: '/harness/xmlservice-getexternalentity',
    method: 'POST',
    sourcePath: 'src/misc/services/xml.service.ts',
    className: 'XmlService',
    symbolCheck: 'getExternalEntity',
    handlerName: 'getExternalEntity',
    internal: true,
  },
  {
    key: 'date.calculateWeekdays',
    route: '/harness/dateservice-calculateweekdays',
    method: 'GET',
    sourcePath: 'src/misc/services/date.service.ts',
    className: 'DateService',
    symbolCheck: 'calculateWeekdays',
    handlerName: 'calculateWeekdays',
    internal: false,
  },
];

const registeredRoutes = new Map();
const loadErrors = [];

function log(...args) {
  console.log('[harness]', ...args);
}

function sendText(res, status, body) {
  res.statusCode = status;
  res.setHeader('content-type', 'text/plain; charset=utf-8');
  res.end(body);
}

function parseQuery(urlObj) {
  const out = {};
  for (const [k, v] of urlObj.searchParams.entries()) out[k] = v;
  return out;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function maybeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeOutput(value) {
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function fileExists(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function dirExists(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function walkFiles(startDir, predicate, results = []) {
  if (!dirExists(startDir)) return results;

  const skipDirs = new Set([
    'node_modules',
    '.git',
    '.next',
    '.nuxt',
    '.cache',
    '.turbo',
    'coverage',
    '.yarn',
    '.pnpm-store',
  ]);

  const entries = fs.readdirSync(startDir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(startDir, entry.name);
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) continue;
      walkFiles(full, predicate, results);
    } else if (entry.isFile()) {
      if (predicate(full)) results.push(full);
    }
  }
  return results;
}

function readTextSafe(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return null;
  }
}

function inspectSourceRequirements() {
  for (const target of TARGETS) {
    const abs = path.join(ROOT, target.sourcePath);
    const text = readTextSafe(abs);
    if (!text) {
      log(`source not readable for inspection: ${target.sourcePath}`);
      continue;
    }
    const hasClass = text.includes(`class ${target.className}`);
    const hasMethod = text.includes(target.symbolCheck);
    log(
      `inspected ${target.sourcePath}: class=${hasClass ? 'yes' : 'no'}, method=${hasMethod ? 'yes' : 'no'}`
    );
  }
}

function tryRegisterTsNode() {
  try {
    require.resolve('ts-node/register/transpile-only', { paths: [ROOT] });
    require('ts-node/register/transpile-only');
    return 'ts-node/register/transpile-only';
  } catch {}
  try {
    require.resolve('ts-node/register', { paths: [ROOT] });
    require('ts-node/register');
    return 'ts-node/register';
  } catch {}
  return null;
}

function buildCandidateList(sourcePath) {
  const absSource = path.join(ROOT, sourcePath);
  const relNoExt = sourcePath.replace(/\.(ts|js)$/, '');
  const base = path.basename(relNoExt);

  const candidates = [];

  if (fileExists(absSource)) candidates.push(absSource);

  const directJsVariants = [
    path.join(ROOT, `${relNoExt}.js`),
    path.join(ROOT, relNoExt.replace(/^src\//, 'dist/') + '.js'),
    path.join(ROOT, relNoExt.replace(/^src\//, 'build/') + '.js'),
    path.join(ROOT, relNoExt.replace(/^src\//, 'out/') + '.js'),
  ];
  for (const p of directJsVariants) {
    if (fileExists(p) && !candidates.includes(p)) candidates.push(p);
  }

  const discovered = walkFiles(
    ROOT,
    p =>
      (p.endsWith(`${base}.js`) || p.endsWith(`${base}.ts`)) &&
      !p.includes(`${path.sep}node_modules${path.sep}`) &&
      !p.includes(`${path.sep}.git${path.sep}`)
  );

  const scored = discovered
    .map(p => {
      let score = 0;
      if (p === absSource) score += 1000;
      if (p.endsWith(sourcePath)) score += 800;
      if (p.includes(`${path.sep}dist${path.sep}`)) score += 300;
      if (p.includes(`${path.sep}build${path.sep}`)) score += 200;
      if (p.includes(`${path.sep}src${path.sep}`)) score += 100;
      if (p.endsWith('.js')) score += 50;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(x => x.p);

  for (const p of scored) {
    if (!candidates.includes(p)) candidates.push(p);
  }

  return candidates;
}

async function loadModule(modulePath) {
  if (modulePath.endsWith('.ts')) {
    return require(modulePath);
  }

  try {
    return require(modulePath);
  } catch (err) {
    if (err && err.code === 'ERR_REQUIRE_ESM') {
      return import(pathToFileURL(modulePath).href);
    }
    throw err;
  }
}

function getExportedClass(mod, className) {
  if (!mod) return null;
  if (mod[className]) return mod[className];
  if (mod.default && mod.default.name === className) return mod.default;
  if (mod.default && mod.default[className]) return mod.default[className];
  return null;
}

async function loadTarget(target) {
  const candidates = buildCandidateList(target.sourcePath);
  let lastError = null;

  for (const candidate of candidates) {
    try {
      const mod = await loadModule(candidate);
      const Klass = getExportedClass(mod, target.className);
      if (!Klass) continue;

      const instance = new Klass();
      const fn = target.internal
        ? instance[target.handlerName]
        : instance[target.handlerName];

      if (typeof fn !== 'function') continue;

      log(`loaded ${target.key} from ${path.relative(ROOT, candidate)}`);
      return {
        target,
        file: candidate,
        instance,
      };
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error(`Unable to load ${target.key}`);
}

function registerRoute(route, method, fn) {
  registeredRoutes.set(`${method.toUpperCase()} ${route}`, fn);
}

function parsePostInput(rawBody) {
  const body = maybeJson(rawBody);
  if (body && typeof body === 'object') return body;
  return { raw: rawBody };
}

async function registerTargets() {
  inspectSourceRequirements();
  const tsNodeMode = tryRegisterTsNode();
  log(`ts loader: ${tsNodeMode || 'not available, will prefer built JS when needed'}`);

  for (const target of TARGETS) {
    try {
      const loaded = await loadTarget(target);
      const service = loaded.instance;

      if (target.key === 'xml.parse') {
        registerRoute(target.route, 'POST', async (req, res) => {
          const rawBody = await readBody(req);
          const body = parsePostInput(rawBody);
          const xml = typeof body.xml === 'string' ? body.xml : rawBody;
          const result = await service.parse(xml);
          sendText(res, 200, normalizeOutput(result));
        });
      }

      if (target.key === 'xml.resolveExternalEntities') {
        registerRoute(target.route, 'POST', async (req, res) => {
          const rawBody = await readBody(req);
          const body = parsePostInput(rawBody);
          const xml = typeof body.xml === 'string' ? body.xml : rawBody;
          const result = await service['resolveExternalEntities'](xml);
          sendText(res, 200, normalizeOutput(result));
        });
      }

      if (target.key === 'xml.getExternalEntity') {
        registerRoute(target.route, 'POST', async (req, res) => {
          const rawBody = await readBody(req);
          const body = parsePostInput(rawBody);
          const systemId =
            typeof body.systemId === 'string' ? body.systemId : rawBody;
          const result = await service['getExternalEntity'](systemId);
          sendText(res, 200, normalizeOutput(result));
        });
      }

      if (target.key === 'date.calculateWeekdays') {
        registerRoute(target.route, 'GET', async (req, res, urlObj) => {
          const q = parseQuery(urlObj);
          const from = q.from ?? '1900-01-01';
          const to = q.to ?? '2500-12-31';
          const weekDayRaw = q.weekDay ?? '1';
          const weekDay = Number(weekDayRaw);
          const result = await service.calculateWeekdays(from, to, weekDay);
          sendText(res, 200, normalizeOutput(result));
        });
      }
    } catch (err) {
      const msg = `${target.key}: ${err && err.stack ? err.stack : String(err)}`;
      loadErrors.push(msg);
      log(`skipping ${target.key}: ${msg}`);
    }
  }
}

function createServer() {
  return http.createServer(async (req, res) => {
    try {
      const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      const method = (req.method || 'GET').toUpperCase();

      if (method === 'GET' && urlObj.pathname === '/health') {
        const summary = {
          ok: true,
          routes: Array.from(registeredRoutes.keys()),
          skipped: loadErrors.length,
        };
        return sendText(res, 200, JSON.stringify(summary));
      }

      const routeKey = `${method} ${urlObj.pathname}`;
      const handler = registeredRoutes.get(routeKey);

      if (!handler) {
        return sendText(res, 404, 'not found');
      }

      await handler(req, res, urlObj);
    } catch (err) {
      sendText(
        res,
        500,
        err && err.stack ? err.stack : `internal error: ${String(err)}`
      );
    }
  });
}

(async () => {
  await registerTargets();

  const server = createServer();
  server.listen(PORT, () => {
    log(`listening on ${PORT}`);
    log(`registered routes: ${Array.from(registeredRoutes.keys()).join(', ') || 'none'}`);
    if (loadErrors.length) {
      log(`skipped targets: ${loadErrors.length}`);
    }
  });
})();
