const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()

const NGINX_URL = process.env.NGINX_URL || 'http://localhost:8000'

chai.use(chaiHttp)

describe('njs', () => {
    it('should response as json', (done) => {
        chai.request(NGINX_URL)
            .get('/test1')
            .end((err, res) => {
                if (err) {
                    done(err)
                    return
                }

                res.should.have.status(200)
                res.should.be.json
                res.body.should.be.an('object')
                res.body.should.have.property('test')
                res.body.test.should.be.an('string')
                    .that.is.equal('TEST1')
                done()
            })
    })

    it('should work js_set', (done) => {
        chai.request(NGINX_URL)
            .get('/test2?test-var=16')
            .end((err, res) => {
                if (err) {
                    done(err)
                    return
                }

                res.should.have.status(200)
                res.should.be.text
                res.text.should.equal('32')
                done()
            })
    })

    it('should work subrequest', (done) => {
        chai.request(NGINX_URL)
            .get('/test3?test=123')
            .end((err, res) => {
                if (err) {
                    done(err)
                    return
                }

                res.should.have.status(200)
                res.should.be.text
                res.text.should.equal('SUBREQUEST 123')
                done()
            })
    })
})
