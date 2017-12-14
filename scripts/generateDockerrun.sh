#!/bin/bash

APPLICATION_NAME=${1}
BUILD_VERSION=${2}

cd $PWD

IMAGE_TAG="mojdigitalstudio/$APPLICATION_NAME:$BUILD_VERSION"

cat <<- _EOF_ > Dockerrun.aws.json
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "${IMAGE_TAG}",
    "Update": "true"
  },
  "Ports": [
    {
      "hostPort": "80",
      "ContainerPort": "3000"
    }
  ]
}
_EOF_
