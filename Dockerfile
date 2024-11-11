FROM alpine:latest

RUN apk add --no-cache git
RUN apk add --no-cache hugo

WORKDIR /src

COPY . .

EXPOSE 1313