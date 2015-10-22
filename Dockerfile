FROM node:4.2.1

RUN mkdir /src

WORKDIR /src
ADD src/package.json /src/
RUN npm install
ADD src /src


CMD []
ENTRYPOINT ["npm", "start"]