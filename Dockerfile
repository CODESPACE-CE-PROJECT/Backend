FROM node:18-alpine AS development

WORKDIR /usr/src/app

COPY --chown=root:root package.json ./

COPY --chown=root:root yarn.lock ./

RUN yarn install

COPY --chown=root:root . .

RUN yarn global add prisma

COPY prisma ./prisma

RUN yarn prisma generate

FROM node:18-alpine AS Build

WORKDIR /usr/src/app

COPY --chown=root:root --chmod=755 package.json ./

COPY --chown=root:root --chmod=755 yarn.lock ./

COPY --chown=root:root --chmod=755 --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=root:root --chmod=755 . .

RUN yarn build

ENV NODE_ENV production

RUN yarn install --frozen-lockfile

RUN yarn prisma generate

FROM node:18-alpine AS production

COPY --chown=root:root --chmod=755 --from=Build /usr/src/app/node_modules ./node_modules
COPY --chown=root:root --chmod=755 --from=Build /usr/src/app/dist ./dist
COPY --chown=root:root --chmod=755 --from=build /usr/src/app/prisma ./prisma

CMD [ "node", "dist/src/main" ]
