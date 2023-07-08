#!/bin/bash

# Usage:
# npm run verbump major|minor|patch message

VERBUMP_LEVEL=$1
shift
MESSAGE=$@
LAST_VERSION=$(git tag | grep -E "v[0-9]+\.[0-9]+(\.[0-9])+?" | sort -rV | head -n 1 | cut -c 2-)

# Inspired by https://github.com/evandrocoan/.versioning/blob/master/update_version.sh
major=$(echo $LAST_VERSION | cut -d'.' -f 1)
minor=$(echo $LAST_VERSION | cut -d'.' -f 2)
patch=$(echo $LAST_VERSION | cut -d'.' -f 3)

### Check version bump level is valid
case "$VERBUMP_LEVEL" in
    major )
        major=$(expr $major + 1)
        minor=0
        patch=0
        ;;

    minor )
        minor=$(expr $minor + 1)
        patch=0
        ;;

    patch )
        if [ -z $patch ]; then patch=0; fi
        patch=$(expr $patch + 1)
        ;;

    * )
        echo "invalid version bump level! Should be major / minor / patch."
        exit 1
        ;;
esac

# TODO: Also version bump the package.json version

### Check changelog has Latest
if (cat docs/changelog.md | tr -d '\r' | tr '\n' '%' \
        | grep -E "^# Version" > /dev/null) ; then
    cat << EOM
(Verbump) Error: Cannot do a verbump without a new commit.
EOM
    exit 1
fi

if ! (cat docs/changelog.md | tr -d '\r' | tr '\n' '%' \
        | grep -E "^# Latest[^#]+?(%%#)" > /dev/null) ; then
    cat << EOM
(Verbump) Warning: changelog file format not correct.

The first line should be "# Latest" and there should be two newlines
before the next version header.
EOM
    exit 1
fi

### Tag the new version
NEXT_VERSION=${major}.${minor}.${patch}
NEW_COMMIT_MESSAGE="Version $NEXT_VERSION: $MESSAGE"

### Update the changelog and commit
if ! (cat docs/changelog.md | tr -d '\r' | tr '\n' '%' \
        | grep -E "^# Latest[^#]+?(%%#)" > /dev/null) ; then
    cat << EOM 
Warning: changelog file format not correct.

The first line should be "# Latest" and there should be two newlines
before the next version header.
EOM
    exit 1
fi
sed -i "s~# Latest~# $NEW_COMMIT_MESSAGE~g" docs/changelog.md
git add docs/changelog.md
VERBUMP=true git commit --no-verify -m "$NEW_COMMIT_MESSAGE"

### Tag new version
git tag -a "v$NEXT_VERSION" -m "$NEW_COMMIT_MESSAGE"

