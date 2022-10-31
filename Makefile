APP = dist/app.js

all: doc build

run:
	npm start $(filter-out $@, $(MAKECMDGOALS))

test:
	npm test

doc:
	npm run docbuild

build:
	npm run build

debug:
	node inspect ${APP}

.PHONY: test
