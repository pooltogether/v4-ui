#!/bin/bash
# Go inside node_modules
cd node_modules
# Link packages
cd react && yarn link 
cd ../react-query && yarn link
cd ../react-dom && yarn link
cd ../jotai && yarn link
# Back to root
cd ../..
# Link components
yarn link @pooltogether/react-hooks