const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const url = require('url');
const csrf = require('csurf');
const expressHandlebars = require('express-handlebars');

const port = process.env.PORT || process.env.NODE_PORT || 3000;
const dbURL = process.env.MONGODB_URI || 'mongodb://localhost/dungeon-dev';

mongoose.connect(dbURL, { useMongoClient: true }, (err) => {
  if (err) {
    console.log('Error connecting to database.');
    throw err;
  }
});

let redisURL = {
  hostname: 'localhost',
  port: 6379,
};
let redisPASS;
if (process.env.REDISCLOUD_URL) {
  redisURL = url.parse(process.env.REDISCLOUD_URL);
  redisPASS = redisURL.auth.split(':')[1];
}

const router = require('./router.js');

const app = express();
app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));
app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
app.use(compression());
app.use(cookieParser());
// limit uses a string to permit larger files
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
app.use(session({
  key: 'sessionid', // Renamed so people can't readily take advantage of holes in 'connect'
  store: new RedisStore({
    host: redisURL.hostname,
    port: redisURL.port,
    pass: redisPASS,
  }),
  secret: 'efc6be135377c32e780f7b437a21f45e2ae3839a',
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
  },
}));
app.use(csrf());
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  console.log('Missing CSRF token');
  return false;
});
app.engine('handlebars', expressHandlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);
app.disable('x-powered-by');

router(app);

app.listen(port, (err) => {
  if (err) { throw err; }
  console.log(`Listening on port: ${port}`);
});
