const chai = require('chai')
const chaiHttp = require('chai-http')
const should = chai.should()

const NGINX_URL = process.env.NGINX_URL || 'http://localhost:8000'
const JAEGER_URL = process.env.JAEGER_URL || 'http://localhost:16686'

chai.use(chaiHttp)

describe('jaeger', () => {
    it('should request to nginx', (done) => {
        chai.request(NGINX_URL)
            .get('/')
            .end((err, res) => {
                if (err) {
                    done(err)
                    return
                }

                res.should.have.status(200)
                done()
            })
    })

    it('should contain data in jaeger', (done) => {
        new Promise((resolve) => setTimeout(resolve, 10000))
            .then(() => {
                chai.request(JAEGER_URL)
                    .get('/api/services')
                    .end((err, res) => {
                        if (err) {
                            done(err)
                            return
                        }

                        res.should.have.status(200)
                        res.should.be.json
                        res.body.should.be.an('object')
                        res.body.should.have.property('data')
                        res.body.data.should.be.an('array')
                            .that.is.not.empty
                        done()
                    })
            })
    })
})
