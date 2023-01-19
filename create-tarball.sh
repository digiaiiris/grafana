#!/bin/bash
# Compress previously compiled public-folder into a tarball
set -e
tar -czvf grafana-build.tar.gz public
