FROM node:4.2.1-slim

RUN npm install -g gulp

RUN mkdir /src

WORKDIR /src
ADD src/package.json /src/
RUN npm install
ADD src /src

CMD []
ENTRYPOINT ["/nodejs/bin/npm", "start"]