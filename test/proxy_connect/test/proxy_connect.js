const chai = require('chai')
const http = require('http')
const https = require('https')
const tunnel = require('tunnel')

const should = chai.should()

const PROXY_HOST = process.env.PROXY_HOST || 'localhost'
const PROXY_PORT = parseInt(process.env.PROXY_PORT, 10) || 3128

describe('http proxy', () => {
    it('should receive http content', (done) => {
        http.request({
            host: PROXY_HOST,
            port: PROXY_PORT,
            path: 'http://httpbin.org/headers',
            headers: {
                Host: 'httpbin.org'
            }
        }, (res) => {
            let buf = ''
            res.on('data', (chunk) => { buf += chunk })
            res.on('end', () => {
                const json = JSON.parse(buf)
                json.should.have.property('headers')
                    .that.have.property('Host')
                    .that.is.equal('httpbin.org')
                done()
            })
        }).end()
    })

    it('should receive https content', (done) => {
        https.request('https://httpbin.org/headers', {
            agent: tunnel.httpsOverHttp({
                proxy: {
                    host: PROXY_HOST,
                    port: PROXY_PORT
                }
            })
        }, (res) => {
            let buf = ''
            res.on('data', (chunk) => { buf += chunk })
            res.on('end', () => {
                const json = JSON.parse(buf)
                json.should.have.property('headers')
                    .that.have.property('Host')
                    .that.is.equal('httpbin.org')
                done()
            })
        }).end()
    })
})
