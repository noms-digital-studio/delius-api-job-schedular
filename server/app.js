const express = require('express');
const bunyanMiddleware = require('bunyan-middleware');
const bodyParser = require('body-parser');
const requireAll = require('require-all');

const errors = require('./errors');
const healthcheck = require('../api/health/healthcheck');

const flatten = (data) => {
  let result = {};

  let recurse = (cur, prop) => {
    let isEmpty = true;

    for (let p in cur) {
      isEmpty = false;
      recurse(cur[p], prop + (!~p.indexOf('index') ? '/' + p : ''));
    }

    if (typeof cur === 'function') {
      result[prop] = cur;
    } else if (isEmpty && prop) {
      result[prop] = {};
    }
  };

  recurse(data, '');

  return result;
};

module.exports = (config, logger, callback, includeErrorHandling = true) => {
  const app = express();
  app.locals.config = config;

  app.use(bunyanMiddleware({ logger: logger }));
  app.use('/job/*', bodyParser.json());
  app.use('/*', bodyParser.raw({ inflate: false, limit: '2048kb', type: '*/*' }));

  setupHealthRoute(app);
  setupRouters(app, logger);

  if (includeErrorHandling) {
    setupErrorHandling(app, config);
  }

  healthcheck(config, logger)
    .then((result) => {
      if (!result.healthy) {
        return logger.error(result);
      }

      logger.info(result);
    })
    .catch((err) => logger.error(err));

  return callback(null, app);
};

function setupHealthRoute(app) {
  app.get('/health', (req, res) =>
    healthcheck(app.locals.config, req.log)
      .then((result) => {
        if (!result.healthy) {
          res.status(500);
        }

        res.json(result);
      })
      .catch((err) => errors.unexpected(res, err.message)));
}

function setupRouters(app, log) {
  log.info('registering controllers...');

  let routes = flatten(requireAll({
    dirname:  __dirname + '/../api/controllers',
    recursive: true,
    resolve: (router) => () => router
  }));

  for (let uri in routes) {
    log.info(uri, routes[uri]);
    app.use(uri, routes[uri]());
  }
};

function setupErrorHandling(app) {
  app.use(function notFoundHandler(req, res) {
    errors.notFound(res, 'No handler exists for this url');
  });

  // eslint-disable-next-line no-unused-vars
  app.use(function errorHandler(err, req, res, next) {
    req.log.warn(err);
    errors.unexpected(res, err);
  });
}
