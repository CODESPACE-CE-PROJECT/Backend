FROM node:20-alpine AS Build

WORKDIR /usr/src/app

RUN apk add --no-cache openssl

COPY --chown=root:root --chmod=755 package.json ./

COPY --chown=root:root --chmod=755 yarn.lock ./

RUN yarn install --frozen-lockfile

COPY --chown=root:root --chmod=755 . .

RUN yarn prisma generate

RUN yarn build


FROM node:20-alpine AS production

RUN apk add --no-cache openssl

ENV NODE_ENV production

COPY --chown=root:root --chmod=755 --from=Build /usr/src/app/node_modules ./node_modules
COPY --chown=root:root --chmod=755 --from=Build /usr/src/app/dist ./dist
COPY --chown=root:root --chmod=755 --from=build /usr/src/app/prisma ./prisma

CMD [ "node", "dist/src/main" ]
