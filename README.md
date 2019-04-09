# Supported tags and respective `Dockerfile` links

- [`latest` (*Dockerfile*)](https://github.com/levonet/docker-nginx/blob/master/Dockerfile)
- [`1.15.11-alpine`, `1.15-alpine` (*Dockerfile*)](https://github.com/levonet/docker-nginx/blob/v1.15.11/Dockerfile)
- [`1.14.2-alpine`, `1.14-alpine` (*Dockerfile*)](https://github.com/levonet/docker-nginx/blob/v1.14.2/Dockerfile)

# NGINX build with load balancer modules

**Fastest** and **smaller** Nginx built for x86-64 CPU architecture.
Nginx binaries are compiled to leverage SSE 4.2 instruction set.

The difference from the [official Nginx docker image](https://hub.docker.com/_/nginx):

- x86-64 CPU architecture only
- with [Sticky module](https://bitbucket.org/nginx-goodies/nginx-sticky-module-ng)
- with [Upstream health check module](https://github.com/2Fast2BCn/nginx_upstream_check_module#readme)
- with [Brotli dynamic module](https://github.com/google/ngx_brotli#readme)
- with [Redis dynamic module](https://www.nginx.com/resources/wiki/modules/redis/)
- with [A forward proxy module](https://github.com/chobits/ngx_http_proxy_connect_module)
- with degradation module
- using `/etc/nginx/sites-enabled/` for virtual host configuration (like Ubuntu)
- without http_xslt, http_image_filter, http_geoip, http_sub, http_dav, http_flv, http_mp4, http_random_index, http_slice, http_stub_status, mail, mail_ssl, stream_geoip modules

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
