const chai = require('chai')
const chaiHttp = require('chai-http')
const http = require('http')

const should = chai.should()
const NGINX_URL = process.env.NGINX_URL || 'http://localhost:8000'

chai.use(chaiHttp)

describe('check', () => {
    let server
    let pingStatus = 200

    before((done) => {
        const requestListener = (req, res) => {
            if (req.url === '/ping') {
                res.writeHead(pingStatus)
                res.end()

                return
            }

            res.setHeader('Content-Type', 'application/json')
            res.writeHead(200)
            res.end(JSON.stringify({test: 1}))
        }

        server = http.createServer(requestListener)
        server.listen(8080, async () => {
            await new Promise((resolve) => setTimeout(resolve, 2000))
            done()
        })
    })

    after((done) => {
        server.close(() => done())
    })

    it('should response if server up', async () => {
        const res = await chai.request(NGINX_URL)
            .get('/test')
        res.should.have.status(200)

        const status = await chai.request(NGINX_URL)
            .get('/status')
            .query({format: 'json'})

console.log(status.body)

        status.should.have.status(200)
        status.should.be.json
        status.body.should.be.an('object')
        status.body.should.have.property('servers')
        status.body.servers.up.should.be.equal(1)
        status.body.servers.down.should.be.equal(0)
        status.body.servers.server[0].upstream.should.be.equal('backend')
        status.body.servers.server[0].status.should.be.equal('up')
        status.body.servers.server[0].fall.should.be.equal(0)
    })

    it('should error if server down', async () => {
        pingStatus = 500
        await new Promise((resolve) => setTimeout(resolve, 5000))

        const res = await chai.request(NGINX_URL)
            .get('/test')
        res.should.have.status(502)

        const status = await chai.request(NGINX_URL)
            .get('/status')
            .query({format: 'json'})

console.log(status.body)

        status.should.have.status(200)
        status.should.be.json
        status.body.should.be.an('object')
        status.body.should.have.property('servers')
        status.body.servers.up.should.be.equal(0)
        status.body.servers.down.should.be.equal(1)
        status.body.servers.server[0].upstream.should.be.equal('backend')
        status.body.servers.server[0].status.should.be.equal('down')
        status.body.servers.server[0].fall.should.be.above(3)
    })

    it('should response if server rised', async () => {
        pingStatus = 200
        await new Promise((resolve) => setTimeout(resolve, 2000))

        const res = await chai.request(NGINX_URL)
            .get('/test')
        res.should.have.status(200)

        const status = await chai.request(NGINX_URL)
            .get('/status')
            .query({format: 'json'})

console.log(status.body)

        status.should.have.status(200)
        status.should.be.json
        status.body.should.be.an('object')
        status.body.should.have.property('servers')
        status.body.servers.up.should.be.equal(1)
        status.body.servers.down.should.be.equal(0)
        status.body.servers.server[0].upstream.should.be.equal('backend')
        status.body.servers.server[0].status.should.be.equal('up')
        status.body.servers.server[0].fall.should.be.equal(0)
    })
})
