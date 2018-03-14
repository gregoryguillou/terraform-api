.DEFAULT_GOAL=linux

BINARY=lineup
GOARCH = amd64

COMMIT=$(shell git rev-parse HEAD | cut -c1-7)
TAG=$(shell git tag -l --contains HEAD | grep "^v" | head -n 1 | sed 's/^v//')
VERSION := $(or ${TAG},${COMMIT},unknown)

CURRENT_DIR=$(shell pwd)
BUILD_DIR_LINK=$(shell readlink ${BUILD_DIR})

# Setup the -ldflags option for go build here, interpolate the variable values
LDFLAGS = -ldflags "-X main.version=${VERSION}"

# Build the project
all: clean linux darwin windows

linux: 
	GOOS=linux GOARCH=${GOARCH} go build ${LDFLAGS} -o build/${BINARY}-linux-${GOARCH} . ; \
	cd - >/dev/null

darwin:
	GOOS=darwin GOARCH=${GOARCH} go build ${LDFLAGS} -o build/${BINARY}-darwin-${GOARCH} . ; \
	cd - >/dev/null

windows:
	GOOS=windows GOARCH=${GOARCH} go build ${LDFLAGS} -o build/${BINARY}-windows-${GOARCH}.exe . ; \
	cd - >/dev/null

fmt:
	go fmt $$(go list ./... | grep -v /vendor/) ; \
	cd - >/dev/null

clean:
	-rm -f build/${BINARY}-*

.PHONY: linux darwin windows clean fmt

