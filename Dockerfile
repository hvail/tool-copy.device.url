FROM node:6.11
WORKDIR /usr/local/run

ADD Start.js            /usr/local/run/Start.js
ADD CopyDeviceAttr.js   /usr/local/run/CopyDeviceAttr.js
ADD CopyDeviceLink.js   /usr/local/run/CopyDeviceLink.js
ADD node_modules        /usr/local/run/node_modules
ADD my_modules          /usr/local/run/my_modules
ADD interface.redis.cache.jar 				/usr/local/run/interface.redis.cache.jar

CMD ["java","-jar","interface.redis.cache.jar","Account","AccountUtil"]
CMD ["java","-jar","interface.redis.cache.jar","Device","DeviceUtil"]
CMD ["node", "Start.js"]
