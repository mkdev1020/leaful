const Router = require('@koa/router');
const router = new Router();
const fs = require('fs')
var path = require('path');
const models = require('../models');

router.post('/', async (ctx) => {
  let base64Data = ctx.request.body.image ? ctx.request.body.image.replace(/^data:image\/png;base64,/, "") : ''

  if(base64Data) {
    await fs.writeFile(`static/images/master/uploads/${ctx.request.body.image_locator}`,
      base64Data,
      'base64',
      function(err) {
        console.log(err);
      });
  }

  let item = await models.HelpCenterEntry.insertItem(ctx.request.body)

  ctx.status = 201
  ctx.body = {
    item
  };
});

router.post('/feedback', async (ctx) => {
  console.log(
    "REQUEST BODY:", ctx.request.body,
    "FILES:       ", ctx.request.files
  );
  console.log('dddddd', ctx.request.body)
  console.log(item)
  // TODO: move file into /static/master/uploads (or somewhere)

  ctx.body = {
  };
});


router.put('/:id', async (ctx) => {

  let base64Data = ctx.request.body.image ? ctx.request.body.image.replace(/^data:image\/png;base64,/, "") : ''

  if(base64Data) {
    await fs.writeFile(`static/images/master/uploads/${ctx.request.body.image_locator}`,
      base64Data,
      'base64',
      function(err) {
        console.log(err);
      });
  }

  const item = await models.HelpCenterEntry.editItem(ctx.request.params.id, ctx.request.body)

  ctx.status = 200;
  ctx.body = {
    item
  };
});

router.delete('/:id', async (ctx) => {
  const help = await models.HelpCenterEntry.deleteItem(ctx.request.params.id)

  ctx.status = 200;
  ctx.body = {
  };
});

router
  .get(
    '/random-pro-tip',

    async (ctx) => {
      const proTip = await models.HelpCenterEntry.getRandomProTip();

      ctx.status = 200;
      ctx.body = {
        proTip,
      };
    },
  );

module.exports = router;
