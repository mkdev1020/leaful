const fs = require('fs');

const Router = require('@koa/router');
const send = require('koa-send');

const router = new Router();

const { Image } = require('../lib/imageProcessor');

router.use('/:sortPath*/:imageName', async (ctx, next) => {
  const paramSpec = {
    w: { name: 'width', type: 'number' },
    h: { name: 'height', type: 'number' },
    fit: { type: 'string' },
    rotate: { type: 'number' },
    cx: { name: 'cropX',      type: 'number' },
    cy: { name: 'cropY',      type: 'number' },
    cw: { name: 'cropWidth',  type: 'number' },
    ch: { name: 'cropHeight', type: 'number' },
  };

  const imageOptions = {};

  const paramEntries = Object.entries(ctx.request.query);
  for (const [key, value] of paramEntries) {
    if (paramSpec[key] === undefined) {
      throw new RequestError(`Invalid parameter '${key}'`);
    }

    const name = paramSpec[key].name || key;
    let normalizedValue = value;
    if (paramSpec[key].type === 'number') {
      normalizedValue = +value;
    }

    imageOptions[name] = normalizedValue;
  }

  ctx.imageOptions = imageOptions;

  await next();
});

router.get('/:sortPath*/:imageName', async (ctx, next) => {
  const imageRelativePath = `${ctx.request.params.sortPath}/${ctx.request.params.imageName}`;
  const image = new Image(imageRelativePath);
  if (!fs.existsSync(image.masterPath)) {
    ctx.status = 404;
    return;
  }
  image.setOptions(ctx.imageOptions);

  const imagePath = await image.procureImage();
  await send(ctx, imagePath, { root: '/' });
});

module.exports = router;
