#!/bin/bash
# Go inside node_modules
cd node_modules
# Link packages
cd react && yarn unlink 
cd ../react-query && yarn unlink
cd ../react-dom && yarn unlink
cd ../jotai && yarn unlink
# Back to root
cd ../..
# Link components
yarn unlink @pooltogether/react-hooks
yarn install --force