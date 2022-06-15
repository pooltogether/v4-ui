cd node_modules
# Link packages
cd /react && yarn link
cd ../react-query && yarn link
cd ../react-dom && yarn link
cd ../feather-icons-react && yarn link
cd ../jotai && yarn link
cd ../framer-motion && yarn link
cd ../lodash && yarn link
cd ../tailwindcss && yarn link
cd ../eth-revert-reason && yarn link
# Link PoolTogether Packages
cd ../@pooltogether 
cd utilities && yarn link
# Back to root
cd ../../.. 
# Link components and hooks
yarn link @pooltogether/hooks
yarn link @pooltogether/react-components