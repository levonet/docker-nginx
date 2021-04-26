DOCKER_TAG ?= latest
TESTS = jaeger njs proxy_connect sticky

.PHONY: all build $(TESTS)
all: build $(TESTS)

build:
	docker build -t levonet/nginx:$(DOCKER_TAG) ..

$(TESTS):
	cd $@; \
	docker-compose up --build --abort-on-container-exit
