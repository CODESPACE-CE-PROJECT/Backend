FROM node:18-alpine AS development

WORKDIR /usr/src/app

COPY --chown=node:node package.json ./

COPY --chown=node:node yarn.lock ./

RUN yarn 

COPY --chown=node:node . .

USER node

FROM node:18-alpine AS Build

WORKDIR /usr/src/app

COPY --chown=root:root --chmod=755 package.json ./

COPY --chown=root:root --chmod=755 yarn.lock ./

COPY --chown=root:root --chmod=755 --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=root:root --chmod=755 . .

RUN yarn build

ENV NODE_ENV production

RUN yarn install --frozen-lockfile

USER node

FROM node:18-alpine AS production

COPY --chown=root:root --chmod=755 --from=Build /usr/src/app/node_modules ./node_modules
COPY --chown=root:root --chmod=755 --from=Build /usr/src/app/dist ./dist

CMD [ "node", "dist/main.js" ]
