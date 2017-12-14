const should = require('chai').should();

const express = require('express');
const router = express.Router();

const request = require('supertest');

const app = require('../../../server/app');
const log = require('../../../server/log');

describe('/job', () => {
  let server;

  before((done) => {
    let config = {
    };

    app(config, log, (err, _server) => {
      if (err) return done(err);
      server = _server;

      done();
    }, false);
  });

  it('can fulfil GET requests', (done) => {
    request(server)
      .get('/hello')
      .accept('json')
      .expect(200)
      .then((response) => {
        should.exist(response);
        console.log('completed request', response.body);
        done();
      })
      .catch((err) => { done(err); });

    request(server)
      .get('/job')
      .accept('json')
      .expect(200)
      .then((job) => {
        should.exist(job);
        console.log('got job', job.body);

        return request(server)
          .post(`/job/${job.body.reqId}`)
          .accept('json')
          .send({ hello: 'world' })
          .expect(202);
      })
      .catch((err) => { done(err); })
      .then((accepted) => {
        should.exist(accepted);
        console.log('completed job', accepted.body);
      })
      .catch((err) => { done(err); });
  });

});
