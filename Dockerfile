FROM node:boron-alpine
MAINTAINER Matt Smith <matt.smith@digital.justice.gov.uk>

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
ADD ./package.json /tmp/package.json
RUN cd /tmp && npm install --production
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

# From here we load our application's code in, therefore the previous docker
# "layer" thats been cached will be used if possible
WORKDIR /opt/app
ADD ./ /opt/app

ENV PORT 80
EXPOSE 80

CMD ["npm", "start"]
