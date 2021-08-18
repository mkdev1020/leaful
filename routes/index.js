
const fs = require('fs');
const path = require('path');

const errorRouter = require('./error');
const imageRouter = require('./images');
const authRouter = require('./auth');
const helpRouter = require('./help');
const statsRouter = require('./stats');
const testRouter = require('./test');

const Router = require('@koa/router');
const router = new Router();

router.use(errorRouter.router.routes());

const ignore = new Set([
  'index.js',
  'error.js',
  'test.js',
  'test.test.js',
]);
const files = fs.readdirSync(__dirname);
const nameRe = /([a-zA-Z0-9-]+)\.js/;
for (fname of files) {
  if (ignore.has(fname)) {
    continue;
  }
  const route = require(path.join(__dirname, fname));
  const match = nameRe.exec(fname);
  const name = match.length > 0 ? match[1] : fname;
  router.use(`/api/${name}`, route.routes());
}

// TODO: only expose in certain environments
router.use('/api/test', testRouter.routes());

module.exports = router;
