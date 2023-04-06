VERBUMP_LEVEL=$1
shift
MESSAGE=$@
LAST_VERSION=$(git tag | grep -E "v[0-9]+\.[0-9]+(\.[0-9])+?" | sort -rV | head -n 1 | cut -c 2-)

# Inspired by https://github.com/evandrocoan/.versioning/blob/master/update_version.sh
major=$(echo $LAST_VERSION | cut -d'.' -f 1)
minor=$(echo $LAST_VERSION | cut -d'.' -f 2)
patch=$(echo $LAST_VERSION | cut -d'.' -f 3)

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

NEXT_VERSION=${major}.${minor}.${patch}

git tag -a "v$NEXT_VERSION" -m "Version $NEXT_VERSION: $MESSAGE"
