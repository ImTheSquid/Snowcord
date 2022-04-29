#!/bin/sh

# ESBuild
esbuild index.jsx --bundle --outfile=bundled.js --platform=node --external:electron

# Move the module.exports to the top of the file to make sure the bundled code is included
sed -i '/module\.exports = (Plugin, Library) => {/d' ./bundled.js
sed -i '1imodule.exports = (Plugin, Library) => {' ./bundled.js

npm run build_plugin Snowcord --prefix ../../
cp ../../release/Snowcord.plugin.js .

# Remove all header data that is undefined
sed -i '/^ \* @.*undefined$/d' ./Snowcord.plugin.js