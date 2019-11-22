#!/bin/bash

# Copyright 2019 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -e  # Exit with nonzero exit code if anything fails
set -x  # Show the commands being run

REPO=git@github.com:google/eme-encryption-scheme-polyfill.git
SOURCE_BRANCH=master
TARGET_BRANCH=gh-pages


# Check out and build the code.
rm -rf build
git clone "$REPO" build

pushd build
git checkout "$SOURCE_BRANCH"
SHA=$(git rev-parse --verify HEAD)
npm install
npm run-script prepublishOnly
popd


# Check out and update the gh-pages branch.
rm -rf gh-pages
git clone "$REPO" gh-pages

pushd gh-pages
git checkout "$TARGET_BRANCH"
git rm -rf *
mv ../build/* .
rm -rf node_modules/
git add *
git commit -m "Deploy to GitHub Pages: $SHA" --no-verify
git push "$REPO" "$TARGET_BRANCH"
popd


# Clean up.
rm -rf build
rm -rf gh-pages
