
const fs = require('fs');

const mkdirp = require('mkdirp')

const { Image, ImageManager, globalOptions } = require('../lib/imageProcessor');

test(`test image processing system`, async () => {
  const testPath = 'test';
  const testImage = `${testPath}/test.jpg`;
  const relativeCachePath = `${globalOptions.CACHE_BASE_PATH}/${testPath}`;

  await ImageManager.clearCacheForImage(testImage);

  let cachedFiles

  // create if it doesn't exist
  mkdirp(relativeCachePath);
  await new Promise(resolve => setTimeout(resolve, 50));

  cachedFiles = fs.readdirSync(relativeCachePath);
  expect(cachedFiles.length).toBe(0);

  const image = new Image(testImage);

  // #1
  await image.procureImage();

  // #2
  image.setOptions({ width: 500 });
  await image.procureImage();

  // #3
  image.setOptions({ width: 500, height: 200, fit: 'fill', cropX: 100, cropY: 120, cropWidth: 200, cropHeight: 50 });
  await image.procureImage();

  // same as #3, but with params in a different order
  image.setOptions({ height: 200, width: 500, fit: 'fill', cropX: 100, cropY: 120, cropWidth: 200, cropHeight: 50 });
  await image.procureImage();

  //
  // there should be exactly 3 images in the cache
  //

  cachedFiles = fs.readdirSync(relativeCachePath);
  expect(cachedFiles.length).toBe(3);

  //
  // clearing cache should work
  //

  await ImageManager.clearCacheForImage(testImage);
  cachedFiles = fs.readdirSync(relativeCachePath);
  expect(cachedFiles.length).toBe(0);
});
