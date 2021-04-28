DOCKER_TAG ?= latest
TESTS = check jaeger njs proxy_connect redis sticky

.PHONY: all build clean $(TESTS)
all: build $(TESTS)

build:
	docker build -t levonet/nginx:$(DOCKER_TAG) ..

$(TESTS):
	cd $@; \
	docker-compose up --build --abort-on-container-exit

clean:
	rm -rf */node_modules
