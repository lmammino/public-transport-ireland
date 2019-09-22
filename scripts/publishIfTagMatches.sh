#!/usr/bin/env bash
CURRENT_TAG=$(git describe --exact-match --tags $(git log -n1 --pretty='%h'))
GIVEN_VERSION=$1

if [ "$CURRENT_TAG" == "$GIVEN_VERSION" ]
then
  echo "Publishing package (Version: $GIVEN_VERSION)"
  npm publish
else
  echo "Error: Given version ($GIVEN_VERSION) does not match current tag ($CURRENT_TAG)"
  echo "Not publishing"
  exit 1
fi

exit 0
