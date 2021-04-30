const chai = require('chai')
const chaiHttp = require('chai-http')
const http = require('http')

const should = chai.should()
const expect = chai.expect
const NGINX_URL = process.env.NGINX_URL || 'http://localhost:8000'
const SERVERS = 2

chai.use(chaiHttp)

describe('sticky', () => {
    const servers = []
    const sessionCookies = []
    const sessionPorts = []

    before((done) => {
        let doneCount = 0
        const finallyDone = () => {
            if (doneCount < (SERVERS - 1)) {
                doneCount++
                return
            }
            done()
        }
        const requestListener = (req, res) => {
            const cookies = parseCookies(req.headers.cookie)
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Set-Cookie', `JSESSIONID=${Math.random().toString(36).substring(7)}`)
            res.writeHead(200)
            res.end(JSON.stringify({port: req.socket.localPort, cookies: cookies}))
        }

        for (let i = 1; i <= SERVERS; i++) {
            const server = http.createServer(requestListener)
            server.listen(8080 + i, () => finallyDone())
            servers.push(server)
        }
    })

    after((done) => {
        let doneCount = 0
        const finallyDone = () => {
            if (doneCount < (SERVERS - 1)) {
                doneCount++
                return
            }
            done()
        }

        while(servers.length) {
            const server = servers.shift()
            server.close(() => finallyDone())
        }
    })

    for (let i = 0; i < 8; i++) {
        it(`should response from same server (${i})`, (done) => {
            chai.request(NGINX_URL)
                .get('/test1')
                .end((err, res) => {
                    if (err) {
                        done(err)
                        return
                    }

                    res.should.have.status(200)
                    res.should.be.json
                    res.should.to.have.cookie('route')
                    res.body.should.be.an('object')
                    res.body.should.have.property('port')
                    res.body.port.should.be.an('number')
                    const upstreamPort = res.body.port
                    const routeCookie = convertCookiesArrayToObject(res.header['set-cookie'])
                        .find((cookie) => cookie['route'])
                        .route

                    const repeat = Math.random() * 2 + 3
                    const requests = []
                    for (let j = 0; j < repeat; j++) {
                        const request = chai.request(NGINX_URL)
                            .get('/test1')
                            .set('Cookie', `route=${routeCookie}`)
                        requests.push(request)
                    }

                    Promise.all(requests)
                        .then((value) => {
                            for (const res of value) {
                                res.should.have.status(200)
                                res.body.port.should.be.an('number')
                                    .that.is.equal(upstreamPort)
                                res.should.to.have.cookie('route')
                            }
                            done()
                        })
                        .catch((error) => done(error))
                })
        })
    }

    it('should response with new route id if wrong route id', (done) => {
        chai.request(NGINX_URL)
            .get('/test1')
            .set('Cookie', 'route=00000000000000000000000000000000')
            .end((err, res) => {
                if (err) {
                    done(err)
                    return
                }

                res.should.have.status(200)
                res.should.to.have.cookie('route')

                done()
            })
    })

    for (let i = 0; i < 8; i++) {
        it(`should response from different servers with new jsession route id (${i})`, (done) => {
            chai.request(NGINX_URL)
                .get('/test2/new')
                .end((err, res) => {
                    if (err) {
                        done(err)
                        return
                    }

                    res.should.have.status(200)
                    res.should.be.json
                    res.should.to.have.cookie('JSESSIONID')
                    res.body.should.be.an('object')
                    res.body.should.have.property('port')
                    res.body.port.should.be.an('number')
                    const upstreamPort = res.body.port
                    const routeCookie = convertCookiesArrayToObject(res.header['set-cookie'])
                        .find((cookie) => cookie['JSESSIONID'])
                        .JSESSIONID
                    expect(sessionCookies).to.not.include(routeCookie)
                    sessionPorts.push(upstreamPort)
                    sessionCookies.push(routeCookie)

                    done()
                })
        })
    }

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 3; j++) {
            it(`should response from same servers with constant jsession route id (${i}:${j})`, (done) => {
                chai.request(NGINX_URL)
                    .get('/test2/session')
                    .set('Cookie', `JSESSIONID=${sessionCookies[i]}`)
                    .end((err, res) => {
                        if (err) {
                            done(err)
                            return
                        }

                        res.should.have.status(200)
                        res.should.be.json
                        res.should.to.have.cookie('JSESSIONID')
                        res.body.should.be.an('object')
                        res.body.should.have.property('port')
                        res.body.port.should.be.an('number')
                            .that.is.equal(sessionPorts[i])
                        const routeCookie = convertCookiesArrayToObject(res.header['set-cookie'])
                            .find((cookie) => cookie['JSESSIONID'])
                            .JSESSIONID
                        expect(routeCookie).to.have.string(res.body.cookies.JSESSIONID)

                        done()
                    })
            })
        }
    }

    it('should error without jsession route id', (done) => {
        chai.request(NGINX_URL)
            .get('/test2/session')
            .end((err, res) => {
                if (err) {
                    done(err)
                    return
                }

                res.should.have.status(401)
                res.header.should.have.not.property('set-cookie')

                done()
            })
    })

    it('should error without jsession route id delimiter', (done) => {
        chai.request(NGINX_URL)
            .get('/test2/session')
            .set('Cookie', 'JSESSIONID=00000000000000000000000000000000')
            .end((err, res) => {
                if (err) {
                    done(err)
                    return
                }

                res.should.have.status(401)
                res.header.should.have.not.property('set-cookie')

                done()
            })
    })

    it('should error if wrong jsession route id', (done) => {
        chai.request(NGINX_URL)
            .get('/test2/session')
            .set('Cookie', 'JSESSIONID=00000000000000000000000000000000:abcdef')
            .end((err, res) => {
                if (err) {
                    done(err)
                    return
                }

                res.should.have.status(502)
                res.header.should.have.not.property('set-cookie')

                done()
            })
    })
})

function parseCookies(cookiesString) {
    const cookies = {}
    if (!cookiesString) {
        return cookies
    }

    cookiesString.split(';').forEach((cookie) => {
        const parts = cookie.match(/(.*?)=(.*)$/)
        cookies[parts[1].trim()] = (parts[2] || '').trim()
    })

    return cookies
}

function convertCookiesArrayToObject(cookiesArray) {
    const cookies = cookiesArray
        .reduce((cookies, cookieString) => {
            const cookieAttrs = cookieString
                .replace(/\s/g, '')
                .split(';')
                .reduce(constructCookieObjectCallback, {})

            cookies.push(cookieAttrs)

            return cookies
        }, [])

    return cookies
}

function constructCookieObjectCallback(cookieAttrs, cookieAttrString) {
    const cookieAttrsArray = cookieAttrString.split('=')

    if (cookieAttrsArray[1]) {
        cookieAttrs[cookieAttrsArray[0]] = cookieAttrsArray[1]
    } else {
        cookieAttrs[cookieAttrsArray[0]] = true
    }

    return cookieAttrs
}
