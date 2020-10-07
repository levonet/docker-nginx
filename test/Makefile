.PHONY: all test

all: test

test: jaeger
	cd $^; \
	docker-compose up --build --abort-on-container-exit
