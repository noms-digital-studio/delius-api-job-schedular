const should = require('chai').should();

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
    request(server).get('/hello').accept('json').expect(200)
      .then((response) => {
        should.exist(response);
        done();
      })
      .catch((err) => { done(err); });

    request(server).get('/job').accept('json').expect(200)
      .then((job) => {
        should.exist(job);

        return request(server)
          .post(`/job/${job.body.reqId}`).accept('json')
          .send({
            status: 200,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: { hello: 'world' }
          })
          .expect(202);
      })
      .catch((err) => { done(err); })
      .then((accepted) => should.exist(accepted));
  });

  it.skip('returns 204 when no job available', (done) => {
    request(server).get('/hello').accept('json').expect(200)
      .then(() => {})
      .catch((err) => { done(err); });

    request(server).get('/job').accept('json').expect(200)
      .then(() => request(server).get('/job').accept('json').expect(204))
      .then((response) => {
        should.exist(response);
        done();
      })
      .catch((err) => { done(err); });
  });

  it('returns 400 when an unrecognised job is passed', () =>
    request(server)
      .post(`/job/ardvark`).accept('json').send({ status: 200 }).expect(400)
      .then((response) => should.not.exist(response.data)));

});
