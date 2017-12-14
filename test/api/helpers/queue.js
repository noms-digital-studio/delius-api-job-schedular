const should = require('chai').should();
const Queue = require('../../../api/helpers/queue');

describe('Queue', () => {

  before((done) => {
    this.queue = new Queue({
      timeout: 50
    });

    done();
  });

  it('can fulfil GET requests', (done) => {
    let reqId = '1';
    let request = {
      path: '/hello',
      method: 'GET',
      headers: { 'accepts': 'application/json' },
    };

    this.queue
      .addRequest(reqId, request)
      .addHandler(reqId, (data) => {
        should.exist(data);
        data.should.have.property('body');
        data.body.should.have.property('hello', 'world');

        done();
      });

      let req = this.queue.nextRequest();
      should.exist(req);
      req.should.have.property('reqId', reqId);
      req.should.have.property('data');
      req.data.should.eq(request);

      this.queue.processResponse(req.reqId, { body: { hello: 'world' } });
  });

  it('only returns requests that have been made', (done) => {
    let reqId = '1';
    let request = {
      path: '/hello',
      method: 'GET',
      headers: { 'accepts': 'application/json' },
    };

    this.queue
      .addRequest(reqId, request)
      .addHandler(reqId, (data) => {
        should.exist(data);
        data.should.have.property('body');
        data.body.should.have.property('hello', 'world');

        done();
      });

      let req = this.queue.nextRequest();
      let req2 = this.queue.nextRequest();
      should.exist(req);
      should.not.exist(req2);

      this.queue.processResponse(req.reqId, { body: { hello: 'world' } });
  });

});
