#!/bin/sh

## Sync dependent files with each other:
## - package.json version => parlinter.js

jsfile=parlinter.js

##----------------------------------------------------------------------------
## Version sync
##----------------------------------------------------------------------------

# Get package.json version.
version=$(perl -n -e'/"version": "(.+)"/ && print "$1"' package.json)

# Sync version
sed -i.bak "s|^// Parlinter .*|// Parlinter $version|" $jsfile
sed -i.bak "s|^const version = .*|const version = \"$version\";|" $jsfile
rm ${jsfile}.bak

echo "Updated $jsfile with package.json version $version"
echo
