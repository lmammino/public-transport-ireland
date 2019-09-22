#!/usr/bin/env bash

PACKAGE_VERSION=$1
CURRENT_REF=$2
CURRENT_TAG=${CURRENT_REF:10}

if [ "$CURRENT_TAG" == "$PACKAGE_VERSION" ]
then
  echo "Publishing package (Version: $PACKAGE_VERSION)"
  npm publish
else
  echo "Error: Given package version ($PACKAGE_VERSION) does not match current tag ($CURRENT_TAG)"
  echo "Not publishing"
  exit 1
fi

exit 0
