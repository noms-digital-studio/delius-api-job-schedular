const express = require('express');
const router = new express.Router();

const helpers = require('../helpers');
const errors = require('../../server/errors');
const uuid = require('uuid/v4');

const Queue = require('../helpers/queue');

const retrieveNextJobRequest = (req, res, next) =>
  (new Promise((resolve /*, reject*/) => {
    let data = req.app.locals.queue.nextRequest();

    req.log.info('next Job Requested');
    req.log.debug(data);

    resolve(data);
  }))
    .then((data) => data ? res.status(200).json(data) : res.status(204).json())
    .catch(helpers.failWithError(res, next));

const processNewJobResponse = (req, res, next) =>
  (new Promise((resolve/*, reject*/) => {
    let reqId = req.params.reqId;
    let data = {
      reqId: reqId,
      status: req.body.status,
      body: req.body.body,
      headers: req.body.headers
    };

    req.log.info('new Job Response Received');
    req.log.debug(data);

    let handler = req.app.locals.queue.processResponse(data.reqId);

    if (!handler) {
      errors.validation(res, `The request identifier '${reqId}' was not recognised`);

      return;
    }

    resolve(handler(data));
  }))
    .then((data) => res.status(202).json(data))
    .catch(helpers.failWithError(res, next));

const processNewRequest = (req, res, next) =>
  (new Promise((resolve /*, reject*/) => {
    let data = {
      reqId: uuid(),
      url: req.originalUrl,
      method: req.method,
      headers: req.headers
    };

    if (Buffer.isBuffer(req.body)) {
      data.body = req.body.toString('base64');
    }

    req.log.info('new Request Made');
    req.log.debug(data);

    req.app.locals.queue
      .addRequest(data.reqId, data)
      .addHandler(data.reqId, (data) => resolve(data));
  }))
    .then((data) => res.status(data.status).set(data.headers).send(data.body))
    .catch(helpers.failWithError(res, next));

// public

router.use((req, res, next) => {
  req.app.locals.queue = req.app.locals.queue || new Queue(req.app.locals.config.queue, req.log);
  next();
});

router.get('/job', retrieveNextJobRequest);
router.post('/job/:reqId', processNewJobResponse);

// this route must be last to handle all other requests
router.all('/*', processNewRequest);

// exports

module.exports = router;
