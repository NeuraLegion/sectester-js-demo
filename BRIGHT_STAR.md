# 🌟 Bright Star — Run Memory

<!-- BRIGHT_STAR_DATA — generated; do not edit -->
```json
{
  "version": 1,
  "generatedAt": "2026-09-03T18:06:15.155Z",
  "techStack": {
    "languages": [
      "JavaScript",
      "TypeScript"
    ],
    "frameworks": [
      "NestJS"
    ],
    "databases": []
  },
  "startup": {
    "command": "docker build -t sectester-js-demo . && docker run -d --name sectester-js-demo -p 3000:3000 sectester-js-demo",
    "port": 3000,
    "prerequisites": [],
    "envVars": {},
    "healthCheckPath": "/api"
  },
  "setup": {
    "completed": false
  },
  "auth": {
    "hasAuth": false
  },
  "hints": {
    "startup": [
      "Repo is a single NestJS API using SQLite (test.db) with an existing root Dockerfile. The Dockerfile copies a repo .env at build/runtime and runs MikroORM migration:up during image build before starting node dist/main on port 3000.",
      "Working startup: build root Dockerfile with `docker build -t sectester-js-demo .`, then run `docker run -d --name sectester-js-demo -p 3000:3000 sectester-js-demo`. App serves Swagger UI at /api on host port 3000."
    ]
  }
}
```
<!-- BRIGHT_STAR_DATA -->
