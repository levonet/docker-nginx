FROM alpine:3.10 AS build

ENV NGINX_VERSION 1.17.7
ENV NJS_MODULE_VERSION 0.3.7
ENV REDIS_MODULE_VERSION 0.3.9

COPY *.patch /tmp/
RUN GPG_KEYS=B0F4253373F8F6F510D42178520A9993A1C052F8 \
	&& addgroup -S nginx \
	&& adduser -D -S -h /var/cache/nginx -s /sbin/nologin -G nginx nginx \
	&& apk add --no-cache \
		curl \
		gcc \
		gettext \
		git \
		gnupg1 \
		libc-dev \
		linux-headers \
		make \
		openssl-dev \
		pcre-dev \
		readline-dev \
		zlib-dev \
	&& curl -fSL https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz -o nginx.tar.gz \
	&& curl -fSL https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz.asc -o nginx.tar.gz.asc \
	&& export GNUPGHOME="$(mktemp -d)" \
	&& found=''; \
	for server in \
		ha.pool.sks-keyservers.net \
		hkp://keyserver.ubuntu.com:80 \
		hkp://p80.pool.sks-keyservers.net:80 \
		pgp.mit.edu \
	; do \
		echo "Fetching GPG key $GPG_KEYS from $server"; \
		gpg --keyserver "$server" --keyserver-options timeout=10 --recv-keys "$GPG_KEYS" && found=yes && break; \
	done; \
	test -z "$found" && echo >&2 "error: failed to fetch GPG key $GPG_KEYS" && exit 1; \
	gpg --batch --verify nginx.tar.gz.asc nginx.tar.gz \
	&& rm -rf "$GNUPGHOME" nginx.tar.gz.asc \
	&& mkdir -p /usr/src \
	&& tar -zxC /usr/src -f nginx.tar.gz \
	&& rm nginx.tar.gz \
	&& cd /usr/src/nginx-${NGINX_VERSION} \
	\
	# An Nginx module for bringing the power of "echo", "sleep", "time" and more to Nginx's config file
	&& git clone https://github.com/openresty/echo-nginx-module.git --depth=1 \
	\
	# Sticky
	&& git clone https://github.com/levonet/nginx-sticky-module-ng.git --depth=1 \
	\
	# Upstream health check
	&& git clone https://github.com/2Fast2BCn/nginx_upstream_check_module.git --depth=1 \
	&& patch -p1 < /usr/src/nginx-${NGINX_VERSION}/nginx_upstream_check_module/check_1.14.0+.patch \
	\
	# Brotli
	&& git clone https://github.com/google/ngx_brotli.git --depth=1 \
	&& (cd ngx_brotli; git submodule update --init) \
	\
	# Redis
	&& mkdir -p /usr/src/nginx-${NGINX_VERSION}/ngx_http_redis \
	&& curl -fSL https://people.freebsd.org/~osa/ngx_http_redis-${REDIS_MODULE_VERSION}.tar.gz -o ngx_http_redis.tar.gz \
	&& tar -zxC /usr/src/nginx-${NGINX_VERSION}/ngx_http_redis -f ngx_http_redis.tar.gz --strip 1 \
	\
	# A forward proxy module for CONNECT request handling
	&& git clone https://github.com/chobits/ngx_http_proxy_connect_module.git --depth=1 \
	&& patch -p1 < /tmp/proxy_connect_rewrite_10158.patch \
	\
	# njs scripting language
	&& git clone -b ${NJS_MODULE_VERSION} https://github.com/nginx/njs.git --depth=1 \
	&& (cd njs; CFLAGS="-O2 -m64 -march=x86-64 -mfpmath=sse -msse4.2 -pipe -fPIC -fomit-frame-pointer" ./configure; make njs; make test) \
	\
	&& CFLAGS="-pipe -m64 -Ofast -flto -mtune=generic -march=x86-64 -fPIE -fPIC -funroll-loops -fstack-protector-strong -mfpmath=sse -msse4.2 -ffast-math -fomit-frame-pointer -Wformat -Werror=format-security -D_FORTIFY_SOURCE=2" \
		./configure \
			--prefix=/etc/nginx \
			--sbin-path=/usr/sbin/nginx \
			--modules-path=/usr/lib/nginx/modules \
			--conf-path=/etc/nginx/nginx.conf \
			--error-log-path=/var/log/nginx/error.log \
			--http-log-path=/var/log/nginx/access.log \
			--pid-path=/var/run/nginx.pid \
			--lock-path=/var/run/nginx.lock \
			--http-client-body-temp-path=/var/cache/nginx/client_temp \
			--http-proxy-temp-path=/var/cache/nginx/proxy_temp \
			--http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp \
			--http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp \
			--http-scgi-temp-path=/var/cache/nginx/scgi_temp \
			--user=nginx \
			--group=nginx \
			--with-compat \
			--with-file-aio \
			--with-http_addition_module \
			--with-http_auth_request_module \
			--with-http_degradation_module \
			--with-http_gunzip_module \
			--with-http_gzip_static_module \
			--with-http_realip_module \
			--with-http_secure_link_module \
			--with-http_ssl_module \
			--with-http_stub_status_module \
			--with-http_v2_module \
			--with-pcre \
			--with-stream \
			--with-stream_realip_module \
			--with-stream_ssl_module \
			--with-stream_ssl_preread_module \
			--with-threads \
			--add-module=/usr/src/nginx-${NGINX_VERSION}/nginx_upstream_check_module \
			--add-module=/usr/src/nginx-${NGINX_VERSION}/ngx_http_proxy_connect_module \
			--add-dynamic-module=/usr/src/nginx-${NGINX_VERSION}/echo-nginx-module \
			--add-dynamic-module=/usr/src/nginx-${NGINX_VERSION}/nginx-sticky-module-ng \
			--add-dynamic-module=/usr/src/nginx-${NGINX_VERSION}/ngx_brotli \
			--add-dynamic-module=/usr/src/nginx-${NGINX_VERSION}/ngx_http_redis \
			--add-dynamic-module=/usr/src/nginx-${NGINX_VERSION}/njs/nginx \
	&& make -j$(getconf _NPROCESSORS_ONLN) \
	&& make install \
	&& rm -rf /etc/nginx/html/ \
	&& mkdir /etc/nginx/conf.d/ \
	&& mkdir /etc/nginx/sites-enabled/ \
	&& mkdir -p /usr/share/nginx/html/ \
	&& install -m644 html/index.html /usr/share/nginx/html/ \
	&& install -m644 html/50x.html /usr/share/nginx/html/ \
	&& install -m755 njs/build/njs /usr/bin/ \
	&& ln -s ../../usr/lib/nginx/modules /etc/nginx/modules \
	&& strip /usr/bin/njs \
	&& strip /usr/sbin/nginx \
	&& strip /usr/lib/nginx/modules/*.so

FROM alpine:3.10

COPY --from=build /etc/nginx /etc/nginx
COPY --from=build /usr/sbin/nginx /usr/sbin/nginx
COPY --from=build /usr/bin/njs /usr/bin/njs
COPY --from=build /usr/bin/envsubst /usr/local/bin/envsubst
COPY --from=build /usr/lib/nginx/ /usr/lib/nginx/
COPY --from=build /usr/share/nginx /usr/share/nginx

COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx.vh.default.conf /etc/nginx/conf.d/default.conf

RUN apk add --no-cache \
		libcrypto1.1 \
		libintl \
		libssl1.1 \
		musl \
		pcre \
		readline \
		tzdata \
		zlib \
	&& addgroup -S nginx \
	&& adduser -D -S -h /var/cache/nginx -s /sbin/nologin -G nginx nginx \
	&& mkdir -p /var/log/nginx \
	&& ln -sf /dev/stdout /var/log/nginx/access.log \
	&& ln -sf /dev/stderr /var/log/nginx/error.log

EXPOSE 80

STOPSIGNAL SIGTERM

CMD ["nginx", "-g", "daemon off;"]
