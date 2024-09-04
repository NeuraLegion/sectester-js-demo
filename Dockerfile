###################
# BUILDER
###################

FROM node:18-alpine AS build

WORKDIR /usr/src/app

# Copy and build NestJS server project
COPY --chown=node:node package*.json ./
COPY --chown=node:node tsconfig.build.json ./
COPY --chown=node:node tsconfig.json ./
COPY --chown=node:node nest-cli.json ./
COPY --chown=node:node .env ./
COPY --chown=node:node src ./src

ENV NPM_CONFIG_LOGLEVEL=error
RUN npm ci --no-audit
RUN npm run build
RUN npm run migration:up
RUN npm prune --production

USER node

###################
# PRODUCTION
###################

FROM node:18-alpine AS production

WORKDIR /usr/src/app

COPY --chown=node:node .env ./
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/package*.json ./
COPY --chown=node:node --from=build /usr/src/app/test.db ./
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

CMD ["npm", "run", "start:prod"]
