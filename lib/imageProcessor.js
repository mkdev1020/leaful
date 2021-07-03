
const fs = require('fs');
const fsp = require("fs/promises");

const path = require('path');

const sharp = require('sharp');
const mkdirp = require('mkdirp')

function extractOptions(options, keys) {
  const extractedObj = {};
  for (const key of keys) {
    if (options[key] !== undefined) {
      extractedObj[key] = options[key];
    }
  }
  return extractedObj;
}

const IMAGE_BASE_PATH = path.join(__dirname, '..', 'static', 'images');
const globalOptions = {
  IMAGE_BASE_PATH,
  MASTER_BASE_PATH : path.join(IMAGE_BASE_PATH, 'master'),
  CACHE_BASE_PATH  : path.join(IMAGE_BASE_PATH, 'cache'),
};
module.exports.globalOptions = globalOptions;

class Image {

  constructor(relativePath) {
    this.relativePath = relativePath;
    this.dirName  = path.dirname(this.relativePath);
    this.baseName = path.basename(this.relativePath);
    this.extName  = path.extname(this.relativePath);

    this.readCache = true;
    this.options = {};
    this.optionOrder = ['width', 'height', 'fit', 'rotate', 'cropX', 'cropY', 'cropWidth', 'cropHeight'];

    this.supportedExtensions = ['png', 'jpg'];
  }

  get cacheBaseName() {
    const encodedOptions = this.encodeOptions();
    // const base64Options = Buffer.from(encodedOptions).toString('base64');
    // const base64BaseName = Buffer.from(this.baseName).toString('base64');

    const base64Options  = ImageManager.encodeSegment(encodedOptions);
    const base64BaseName = ImageManager.encodeSegment(this.baseName);

    const fullName = `${base64BaseName}___${base64Options}`;
    return `${fullName}${this.extName}`;
  }

  get masterPath() {
    return ImageManager.getMasterPath(this.dirName, this.baseName);
  }

  get cachePath() {
    return ImageManager.getCachePath(this.dirName, this.cacheBaseName);
  }

  encodeOptions() {
    let encoded = '';
    for (const option of this.optionOrder) {
      if (this.options[option] === undefined) {
        continue;
      }
      const value = this.options[option];
      encoded = `${encoded}__${option}=${value}`;
    }
    return encoded;
  }

  bustCache() {
    this.readCache = false;
  }

  setOptions(options) {
    this.options = options;
  }

  getNormalizedExt(pathName) {
    const ext = path
      .extname(pathName)
      .toLowerCase()
      .slice(1)
    ;
    return ext;
  }

  async render() {
    mkdirp(path.join(globalOptions.CACHE_BASE_PATH, this.dirName));

    const ext = this.getNormalizedExt(this.masterPath);
    if (!this.supportedExtensions.includes(ext)) {
      // need to wait a little bit for the directory to be readable
      await new Promise(resolve => setTimeout(resolve, 50));

      fs.copyFileSync(this.masterPath, this.cachePath);
      return this.cachePath;
    }

    let transformed = sharp(this.masterPath);

    const resizeOptions = extractOptions(this.options, ['width', 'height', 'fit']);
    if (Object.keys(resizeOptions).length > 0) {
      transformed = transformed.resize(resizeOptions);
    }

    if (this.options.rotate) {
      transformed = transformed.rotate(this.options.rotate);
    }

    const cropOptions = extractOptions(this.options, ['cropX', 'cropY', 'cropWidth', 'cropHeight']);
    if (Object.keys(cropOptions).length > 0) {
      transformed = transformed.extract({
        left  : cropOptions.cropX,
        top   : cropOptions.cropY,
        width : cropOptions.cropWidth,
        height: cropOptions.cropHeight,
      });
    }

    return await transformed.toFile(this.cachePath);
  }

  async procureImage() {
    if (!this.readCache || !fs.existsSync(this.cachePath)) {
      await this.render();
    }
    return this.cachePath;
  }

}
module.exports.Image = Image;

class ImageManager {

  // decodeCacheLocator() {
  //   return Buffer.from(imageLocator, 'base64').toString('utf8');
  // }

  static async clearCacheForImage(relativePath) {
    const dirName  = path.dirname(relativePath);
    const baseName = path.basename(relativePath);

    if (!dirName || !baseName) {
      return;
    }

    const relativePathDir = path.join(globalOptions.CACHE_BASE_PATH, dirName);
    if (!fs.existsSync(relativePathDir)) {
      return;
    }
    const files = fs.readdirSync(relativePathDir);

    const pathsToUnlink = [];
    for (const fname of files) {
      const primaryLocator = ImageManager.encodeSegment(baseName);
      const matcher = new RegExp(`${primaryLocator}___.+`);

      const matches = matcher.exec(fname);
      if (matches) {
        const matchFileName = matches[0];
        const pathToUnlink = path.join(relativePathDir, matchFileName);
        pathsToUnlink.push(pathToUnlink);
      }
    }

    await Promise.all(pathsToUnlink.map(path => fsp.unlink(path)));
  }

  static getMasterPath(dirName, baseName) {
    return path.join(globalOptions.MASTER_BASE_PATH, dirName, baseName);
  }

  static getCachePath(dirName, cacheBaseName) {
    return path.join(globalOptions.CACHE_BASE_PATH, dirName, cacheBaseName);
  }

  static encodeSegment(segment) {
    return Buffer.from(segment).toString('base64');
  }

}
module.exports.ImageManager = ImageManager;
