const serve = require('koa-static');
const mount = require('koa-mount');
const Koa = require('koa');
const app = new Koa();

app.use(async function (ctx, next){
  ctx.set('Access-Control-Allow-Origin', '*');
  await next();
});

// $ GET /package.json
app.use(mount('/public', serve(`${__dirname}/public`)));

app.listen(process.env.PORT, '0.0.0.0', () => {
  console.log('listen 8080')
});
