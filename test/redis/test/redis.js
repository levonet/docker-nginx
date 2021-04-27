const chai = require('chai')
const chaiHttp = require('chai-http')
const http = require('http')
const redis = require('redis')

const should = chai.should()
const expect = chai.expect
const NGINX_URL = process.env.NGINX_URL || 'http://localhost:8000'
const REDIS_HOST = process.env.REDIS_HOST || 'localhost'
const REDIS_PORT = process.env.REDIS_PORT || '6379'

chai.use(chaiHttp)

describe('redis', () => {
    let server
    let client
    let requestCount

    before((done) => {
        const requestListener = (req, res) => {
            const rnd = Math.random()
            requestCount++
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(200)
            res.end(JSON.stringify({rnd: rnd}))
        }

        client = redis.createClient(REDIS_PORT, REDIS_HOST)
        server = http.createServer(requestListener)
        server.listen(8080, () => done())
    })

    after((done) => {
        client.end(true)
        server.close(() => done())
    })

    beforeEach(() => {
        requestCount = 0
    })

    it('should get a server response if redis empty', (done) => {
        chai.request(NGINX_URL)
            .get('/test')
            .query({test1: 'foo', test2: 10})
            .end((err, res) => {
                expect(err).to.be.null
                expect(requestCount).to.equal(1)
                res.should.have.status(200)
                done()
            })
    })

    it('should get a redis response if redis has key', (done) => {
        client.set('foo:20', '{"rnd":123}')

        chai.request(NGINX_URL)
            .get('/test')
            .query({test1: 'foo', test2: 20})
            .end((err, res) => {
                expect(err).to.be.null
                expect(requestCount).to.equal(0)
                res.should.have.status(200)
                res.body.rnd.should.be.equal(123)
                done()
            })
    })
})
