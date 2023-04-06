#!/bin/bash
# Deploys to github pages.
mkdir .githooks/deployment
VERSION=$(git tag | grep -E "v[0-9]+\.[0-9]+(\.[0-9])+?" | sort -rV | head -n 1 | cut -c 2-)
GH_URL=$(git remote get-url github)
cd .githooks/deployment
git clone --no-checkout ../.. tmp
mv build/* tmp 
cd tmp
git reset gh-pages
git add . 
git commit -m "Github pages build for Version $VERSION"
git remote add github $GH_URL
echo -e "Now run: \n git push github gh-pages"