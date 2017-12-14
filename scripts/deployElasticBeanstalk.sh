#!/bin/bash

APPLICATION_NAME=${1}
BUILD_VERSION=${2}

cd $PWD

./scripts/generateDockerrun.sh ${APPLICATION_NAME} ${BUILD_VERSION}

~/.local/bin/eb deploy --process --verbose
