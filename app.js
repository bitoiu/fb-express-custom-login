var express = require('express');
var index = require('./routes/index');
var http = require('http');
var path = require('path');
var fbSession = require('./middleware/fbSession.js')

app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// property file instead
app.set('fb-id', '686180148106590' )
app.set('fb-secret', 'f00fdfd47504796a1074cad47d865eec')
app.set('fb-scope', 'email, user_about_me, user_birthday, user_location')
app.set('fb-graph-url', 'https://graph.facebook.com')

app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('wXp7,8FXENc%>9n'));
app.use(express.cookieSession());
app.use(fbSession.validSession);
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  app.set('fb-redirect', 'http://localhost:3000/')
}

app.get('/', index.ready);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
