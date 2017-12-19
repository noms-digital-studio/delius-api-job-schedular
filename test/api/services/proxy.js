const should = require('chai').should();

const Proxy = require('../../../api/services/proxy');

describe('A Proxy service', () => {

    it('requires a URL', () => {
      let proxy = new Proxy({}, { info: () => {}, debug: () => {} });

      return proxy.processNewRequest({})
        .catch((err) => {
          should.exist(err);
          err.status.should.equal(400);
          err.message.should.equal('A request must include a url and and HTTP method');
        });
    });

    it('requires a HTTP Method', () => {
      let proxy = new Proxy({}, { info: () => {}, debug: () => {} });

      return proxy.processNewRequest({ url: '/hello' })
        .catch((err) => {
          should.exist(err);
          err.status.should.equal(400);
          err.message.should.equal('A request must include a url and and HTTP method');
        });
    });

    it.skip('requires a valid HTTP Method', () => {
      let proxy = new Proxy({}, { info: () => {}, debug: () => {} });

      return proxy.processNewRequest({ url: '/hello', method: 'FOO' })
        .then((data) => {
          should.exist(data);
        })
        .catch((err) => {
          should.not.exist(err);
        });
    });
/*
    it.skip('can process requests', () => {
      let proxy = new Proxy({}, { info: () => {}, debug: () => {} });

      proxy.processNewRequest({ url: '/hello', method: 'GET' });

      let job = proxy.retrieveNextJobRequest();

      job.should.have.property('reqId');
      job.should.have.property('url', '/hello');
      job.should.have.property('methos', 'GET');
    });
*/
});
