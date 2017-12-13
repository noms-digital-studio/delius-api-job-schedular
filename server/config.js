require('dotenv').config();
const pkg = require('../package.json');
const env = process.env;

const dev = env.NODE_ENV !== 'production';

const get = (name, fallback, options = {}) => {
  if (process.env[name]) {
      return process.env[name];
  }

  if (fallback !== undefined && (dev || !options.requireInProduction)) {
        return fallback;
    }

    throw new Error('Missing env var ' + name);
};

module.exports = {
  name: pkg.name,
  version: pkg.version,

  dev: dev,
  buildDate: env.BUILD_DATE,
  commitId: env.COMMIT_ID,
  buildTag: env.BUILD_TAG,

  port: get('PORT', 3000),
};
