const uuid = require('uuid/v4');

const Queue = require('../helpers/queue');

function Proxy(config, logger) {
  this.config = Object.assign({
    timeout: 10000 // 10 secs
  }, config);

  this.queue = new Queue(this.config);
  this.logger = logger;
};

Proxy.prototype.processNewRequest = function (req) {
  let queue = this.queue;
  let logger = this.logger;

  return new Promise((resolve, reject) => {
    if (!req || !req.method || !req.url) {
      let error = new Error(`A request must include a url and and HTTP method`);
      error.status = 400;

      return reject(error);
    }

    let data = Object.assign({ reqId: uuid() }, req);

    logger.info('new Request Made');
    logger.debug(data);

    queue
      .addRequest(data.reqId, data)
      .addHandler(data.reqId, (data) => resolve(data));
  });
};

Proxy.prototype.retrieveNextJobRequest = function () {
  let queue = this.queue;
  let logger = this.logger;

  let data = queue.nextRequest();

  logger.info('next Job Requested');
  logger.debug(data);

  return data;
};

Proxy.prototype.processNewJobResponse = function (reqId, req) {
  let queue = this.queue;
  let logger = this.logger;

  return new Promise((resolve, reject) => {
    let data = Object.assign({ reqId }, req);

    logger.info('new Job Response Received');
    logger.debug(data);

    let handler = queue.processResponse(data.reqId);

    if (!handler) {
      let error = new Error(`The request identifier '${reqId}' was not recognised`);
      error.status = 400;

      return reject(error);
    }

    let response = handler(data);

    logger.debug(response);

    resolve(response);
  });
};

module.exports = Proxy;
