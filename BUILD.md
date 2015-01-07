# Uglify and minify the code
npm install -g uglifyjs
uglifyjs ./src/galaxy.js --source-map ./build/galaxy.map --screw-ie8 -o ./build/galaxy.min.js -m

# Compile and build for example application
node ./example/build/r.js -o ./example/build/build.js
