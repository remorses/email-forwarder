FROM node:10-alpine

RUN apk  add --no-cache dumb-init # build-base

WORKDIR /src

COPY *.json /src/

RUN npm ci

COPY . /src/

RUN npx tsc

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
