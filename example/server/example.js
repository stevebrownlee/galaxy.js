var connect = require('connect')
  , http = require('http');

var app = connect()
  .use(connect.favicon())
  .use(connect.logger('dev'))
  .use(connect.static('../'))
  .use(connect.cookieParser())
  .use(connect.session({ secret: 't3gh46uju6hytwfe' }));

http.createServer(app).listen(8001);