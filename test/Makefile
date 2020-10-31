TESTS = jaeger njs

.PHONY: all $(TESTS)
all: $(TESTS)

$(TESTS):
	cd $@; \
	docker-compose up --build --abort-on-container-exit
