DOCKER_TAG ?= latest
DOCKER_IMAGE ?= levonet/nginx:$(DOCKER_TAG)
TESTS = check jaeger njs proxy_connect redis sticky
DOCKER ?= docker
DOCKER_COMPOSE ?= docker-compose

.PHONY: all build test clean $(TESTS)
all: build test
test: $(TESTS)

build:
	$(DOCKER) build -t $(DOCKER_IMAGE) ..

$(TESTS):
	cd $@; \
	$(DOCKER_COMPOSE) up --build --abort-on-container-exit

clean:
	rm -rf */node_modules
