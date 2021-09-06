DOCKER_TAG ?= latest
DOCKER_IMAGE ?= levonet/nginx:$(DOCKER_TAG)
TESTS = check jaeger njs proxy_connect redis sticky

.PHONY: all build test clean $(TESTS)
all: build test
test: $(TESTS)

build:
	docker build -t $(DOCKER_IMAGE) ..

$(TESTS):
	cd $@; \
	docker-compose up --build --abort-on-container-exit

clean:
	rm -rf */node_modules
