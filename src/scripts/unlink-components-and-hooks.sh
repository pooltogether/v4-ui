cd node_modules
# Link packages
cd /react && yarn unlink
cd ../react-query && yarn unlink
cd ../react-dom && yarn unlink
cd ../feather-icons-react && yarn unlink
cd ../jotai && yarn unlink
cd ../framer-motion && yarn unlink
cd ../lodash && yarn unlink
cd ../tailwindcss && yarn unlink
cd ../eth-revert-reason && yarn unlink
# Link PoolTogether Packages
cd ../@pooltogether 
cd utilities && yarn unlink
# Back to root
cd ../../.. 
# Link components and hooks
yarn unlink @pooltogether/hooks
yarn unlink @pooltogether/react-components
yarn install --force