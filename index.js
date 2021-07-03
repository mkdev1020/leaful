
const Koa = require('koa');
const cors = require('@koa/cors');
const Router = require('@koa/router');
const formidable = require('koa2-formidable');
const bodyParser = require('koa-bodyparser');
const jwtDecode = require('jwt-decode');

const allRoutes = require('./routes');

const router = new Router();
router.use(allRoutes.routes());

async function tokenParser (ctx, next) {
  const authHeader = ctx.request.header.authorization;
  if (authHeader === undefined) {
    return await next();
  }

  const bearerRegExp = /Bearer (.+)/;
  const matches = bearerRegExp.exec(authHeader);
  if (matches) {
    ctx.accessToken = matches[1];
    ctx.accessTokenDecoded = jwtDecode(ctx.accessToken);
  }

  await next();
}

const app = new Koa();
app.proxy = true;
app
  .use(cors({
    'Access-Control-Allow-Origin' : '*',
  }))
  .use(tokenParser)
  .use(formidable())
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());
const port = 3456;
app.listen(port, ()=>{
  console.log(`Server is running on port ${port}.`);
});
