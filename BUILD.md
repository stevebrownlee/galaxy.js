# Uglify and minify the code
    npm install -g uglifyjs

    uglifyjs ./src/galaxy.js --screw-ie8 -o ./dist/galaxy.min.js -c -m -r 'exports,Q,ko,postal,define,require'
    
# Compile and build for example application

    cd example/build
    node r.js -o build.js
