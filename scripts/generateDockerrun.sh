#!/bin/bash

APPLICATION_NAME=${1}
BUILD_VERSION=${2}

cd $PWD

cat <<- _EOF_ > Dockerrun.aws.json
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "mojdigitalstudio/${APPLICATION_NAME}:${BUILD_VERSION}",
    "Update": "true"
  },
  "Ports": [
    {
      "hostPort": "80",
      "ContainerPort": "8080"
    }
  ]
}
_EOF_
