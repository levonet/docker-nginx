# Supported tags and respective `Dockerfile` links

- [`latest` (*Dockerfile*)](https://github.com/levonet/docker-nginx/blob/master/Dockerfile)
- [`1.23.2-alpine`, `1.23-alpine` (*Dockerfile*)](https://github.com/levonet/docker-nginx/blob/v1.23.2/Dockerfile) Mainline version
- [`1.22.0-alpine`, `1.22-alpine` (*Dockerfile*)](https://github.com/levonet/docker-nginx/blob/v1.22.0/Dockerfile) Stable version
- <details><summary>Older versions</summary>

  - [`1.21.6-alpine`, `1.21-alpine` (*Dockerfile*)](https://github.com/levonet/docker-nginx/blob/v1.21.6/Dockerfile)
  - [`1.20.1-alpine`, `1.20-alpine` (*Dockerfile*)](https://github.com/levonet/docker-nginx/blob/v1.20.1/Dockerfile)
  - [`1.19.10-alpine`, `1.19-alpine` (*Dockerfile*)](https://github.com/levonet/docker-nginx/blob/v1.19.10/Dockerfile)
  - [`1.18.0-alpine`, `1.18-alpine` (*Dockerfile*)](https://github.com/levonet/docker-nginx/blob/v1.18.0/Dockerfile)
  - [`1.17.10-alpine`, `1.17-alpine` (*Dockerfile*)](https://github.com/levonet/docker-nginx/blob/v1.17.10/Dockerfile)
  - [`1.16.0-alpine`, `1.16-alpine` (*Dockerfile*)](https://github.com/levonet/docker-nginx/blob/v1.16.0/Dockerfile)
  - [`1.15.12-alpine`, `1.15-alpine` (*Dockerfile*)](https://github.com/levonet/docker-nginx/blob/v1.15.12/Dockerfile)
  - [`1.14.2-alpine`, `1.14-alpine` (*Dockerfile*)](https://github.com/levonet/docker-nginx/blob/v1.14.2/Dockerfile)
</details>

# NGINX build with load balancer modules
[![](https://images.microbadger.com/badges/image/levonet/nginx.svg)](https://microbadger.com/images/levonet/nginx "Get your own image badge on microbadger.com")
[![Docker Pulls](https://img.shields.io/docker/pulls/levonet/nginx.svg)](https://hub.docker.com/r/levonet/nginx/)

**Fastest** and **smaller** Nginx built for x86-64 CPU architecture.
Nginx binaries are compiled to leverage SSE 4.2 instruction set.

The difference from the [official Nginx docker image](https://hub.docker.com/_/nginx):

- x86-64 CPU architecture only
- with [njs scripting language](http://nginx.org/en/docs/njs/) dynamic module
- with [Sticky](https://github.com/levonet/nginx-sticky-module-ng) dynamic module
- with [Sync upstreams](https://github.com/weibocom/nginx-upsync-module#readme) dynamic module
- with [Stream sync upstreams](https://github.com/xiaokai-wang/nginx-stream-upsync-module#readme) dynamic module
- with [Upstream health check](https://github.com/levonet/nginx_upstream_check_module#readme) module
- with [Brotli](https://github.com/google/ngx_brotli#readme) dynamic module
- with [Various set_xxx directives](https://github.com/openresty/set-misc-nginx-module#readme) dynamic module
- with [Headers more](https://github.com/openresty/headers-more-nginx-module#readme) dynamic module
- with [SRCache](https://github.com/openresty/srcache-nginx-module) dynamic module
- with [Memc](https://github.com/openresty/memc-nginx-module) dynamic module
- with [PostgreSQL](https://github.com/openresty/ngx_postgres) dynamic module
- with [Redis](https://www.nginx.com/resources/wiki/modules/redis/) dynamic module
- with [Redis2](https://github.com/openresty/redis2-nginx-module) dynamic module
- with [Resty DBD Streams to JSON](https://github.com/openresty/rds-json-nginx-module) dynamic module
- with [Echo](https://github.com/openresty/echo-nginx-module) dynamic module
- with [A forward proxy](https://github.com/chobits/ngx_http_proxy_connect_module) module
- with [Opentracing](https://github.com/opentracing-contrib/nginx-opentracing) dynamic module
  and [Jaeger](https://github.com/jaegertracing/jaeger-client-cpp) plugin
- with degradation module
- using `/etc/nginx/sites-enabled/` for virtual host configuration (like Ubuntu)
- without modules: http_xslt, http_image_filter, http_sub, http_dav, http_flv, http_mp4, http_random_index, http_slice, mail, mail_ssl, http_geoip, stream_geoip

## How to use this image

### Hosting some simple static content

```sh
docker run --name some-nginx -d -v /some/content:/usr/share/nginx/html:ro levonet/nginx
```

### Exposing ports

```sh
docker run --name some-nginx -d -p 80:80 -e 443 -p 443:443 levonet/nginx
```

### Complex configuration

```sh
docker run --name some-nginx -d -v /host/path/virtualhosts.d:/etc/nginx/sites-enabled:ro levonet/nginx
```
For example porting Ubuntu nginx to docker:

```sh
docker run --name some-nginx -d -p 80:80 -e 443 -p 443:443 \
    -v /etc/nginx/conf.d:/etc/nginx/conf.d \
    -v /etc/nginx/sites-available:/etc/nginx/sites-available \
    -v /etc/nginx/sites-enabled:/etc/nginx/sites-enabled \
    -v /var/log/nginx:/var/log/nginx \
    levonet/nginx
```

### Modules

List dynamic modules in container:

```sh
docker run -t --rm levonet/nginx ls /usr/lib/nginx/modules
```

Example of loading a module in `nginx.conf`:

```
load_module modules/ngx_http_js_module.so;
```

### njs scripts development

```sh
docker run -it --rm levonet/nginx njs
>> var a = {b: []};
undefined
>> console.log(a);
{b:[]}
undefined
>> JSON.stringify(a);
'{"b":[]}'
>>
```

## Test & Examles

Sample configurations and module tests are located in a folder named `test`.

To run tests, go to the folder `test` and run command `make`.

To start a specific example, go to an example folder and run `docker-compose up`.

## Image Variants

### `levonet/nginx:<version>-alpine`

This image is based on the popular [Alpine Linux project](http://alpinelinux.org/), available in [the `alpine` official image](https://hub.docker.com/_/alpine).
Alpine Linux is much smaller than most distribution base images (~5MB), and thus leads to much slimmer images in general.

This variant is highly recommended when final image size being as small as possible is desired. The main caveat to note is that it does use [musl libc](http://www.musl-libc.org/) instead of [glibc and friends](http://www.etalabs.net/compare_libcs.html), so certain software might run into issues depending on the depth of their libc requirements. However, most software doesn't have an issue with this, so this variant is usually a very safe choice.
See [this Hacker News comment thread](https://news.ycombinator.com/item?id=10782897) for more discussion of the issues that might arise and some pro/con comparisons of using Alpine-based images.

To minimize image size, it's uncommon for additional related tools (such as `git` or `bash`) to be included in Alpine-based images. Using this image as a base, add the things you need in your own Dockerfile (see the [`alpine` image description](https://hub.docker.com/_/alpine/) for examples of how to install packages if you are unfamiliar).

## License

View [license information](http://nginx.org/LICENSE) for the software contained in this image or [license information](https://github.com/levonet/docker-nginx/blob/master/LICENSE) for the Nginx Dockerfile.

As with all Docker images, these likely also contain other software which may be under other licenses (such as Bash, etc from the base distribution, along with any direct or indirect dependencies of the primary software being contained).

As for any pre-built image usage, it is the image user's responsibility to ensure that any use of this image complies with any relevant licenses for all software contained within.
