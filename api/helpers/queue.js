function Queue(config) {
  this.queue = [];
  this.handlers = {};
  this.requests = {};

  this.config = Object.assign({
    timeout: 10000 // 10 secs
  }, config);
};

Queue.prototype.addRequest = function(reqId, data) {
  this.requests[reqId] = data;
  this.queue.push(reqId);

  return this;
};

Queue.prototype.addHandler = function(reqId, handler) {
  this.handlers[reqId] = handler;

  return this;
};

Queue.prototype.nextRequest = function() {
  let reqId = this.queue.pop();

  if (!reqId) return;

  let data = this.requests[reqId];

  delete this.requests[reqId];

  return {reqId, data};
};

Queue.prototype.processResponse = function(reqId, data) {
  let handler = this.handlers[reqId];
  delete this.handlers[reqId];

  handler(data);

  return this;
};

module.exports = Queue;
