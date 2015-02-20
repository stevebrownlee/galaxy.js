# Uglify and minify the code
    npm install -g uglifyjs

    uglifyjs ./src/galaxy.js --source-map ./build/galaxy.map --screw-ie8 -o ./build/galaxy.min.js -m

# Compile and build for example application

    cd example/build
    node r.js -o build.js
