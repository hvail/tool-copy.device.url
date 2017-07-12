FROM node:6.11
WORKDIR /usr/local/run

ADD Start.js            /usr/local/run/Start.js
ADD CopyDeviceAttr.js   /usr/local/run/CopyDeviceAttr.js
ADD CopyDeviceLink.js   /usr/local/run/CopyDeviceLink.js
ADD node_modules        /usr/local/run/node_modules

CMD ["node", "Start.js"]

