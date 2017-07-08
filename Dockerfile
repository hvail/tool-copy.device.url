FROM node:6.11
WORKDIR /usr/local/run

ADD Start.js        /usr/local/run/Start.js
ADD node_modules    /usr/local/run/node_modules

CMD ["node", "Start.js"]
