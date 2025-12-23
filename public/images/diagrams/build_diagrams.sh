#!/usr/bin/env bash

set -e

# Go through every file in the script directory that ends in .d2 and run d2 on it
for file in $(find . -name "*.d2"); do
    d2 $file $(basename $file).svg
done
