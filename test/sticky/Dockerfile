FROM node:10-slim AS base

ENV DOCKERIZE_VERSION v0.6.1
RUN set -eux \
    && apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl \
    && curl -fSL https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz -o dockerize-linux-amd64.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64.tar.gz \
    && rm dockerize-linux-amd64.tar.gz

RUN mkdir -p /test
WORKDIR /test

COPY package.json yarn.lock /test/
RUN yarn
COPY test /test/test

EXPOSE 8081
EXPOSE 8082
