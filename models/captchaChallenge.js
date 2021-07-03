
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

function randomShuffle(array) {
  const shuffledArray = [];
  array = array.slice();
  while (array.length) {
    const index = Math.floor(Math.random() * array.length);
    const value = array[index];
    shuffledArray.push(value);
    array.splice(index, 1);
  }
  return shuffledArray;
}

module.exports = (sequelize) => {
  const CaptchaChallenge = require(__dirname + '/definitions/captcha_challenges')(sequelize);

  const CaptchaSolution = require(__dirname + '/captchaSolution')(sequelize);

  CaptchaChallenge.generate = async function() {
    const solution = await CaptchaSolution.getRandom();
    const id    = uuidv4().replace(/-/g, '').slice(0, 16);
    const order = uuidv4().replace(/-/g, '').slice(0, 16);

    // const order = randomShuffle([1, 2, 3, 4]);

    if (!solution) {
      throw new Error(`No captcha solutions available!`);
    }

    return await CaptchaChallenge.create({
      id,
      captcha_solutions_id: solution.id,
      solution_order: order,
    });
  };

  CaptchaChallenge.validateAndDestroy = async function(id, inputCodes) {
    const challenge = await CaptchaChallenge.findByPk(id);
    if (!challenge) {
      return false;
    }

    const valid = challenge.doInputCodesMatch(inputCodes);
    await challenge.destroy();
    return valid;
  };

  CaptchaChallenge.getEncodedLetterImage = function(letter) {
    letter = letter.toLowerCase();
    let basePath = path.join(__dirname, `../static/images/master/captcha`);

    if (process.env.NODE_ENV === 'test') {
      basePath = path.join(__dirname, `../tests/images`);
    }
    const fileName = `${letter}.svg`;
    const filePath = path.join(basePath, fileName);
    return fs.readFileSync(filePath)
      .toString()
      // crude way of changing letter color from white to black
      .replace('<path fill="#FFFFFF"', '<path fill="#000000"')
    ;
  };

  CaptchaChallenge.prototype.getSolutionEntity = async function() {
    return await CaptchaSolution.findByPk(this.captcha_solutions_id);
  };

  CaptchaChallenge.prototype.getInputCodes = async function () {
    const solution = await CaptchaSolution.findByPk(this.captcha_solutions_id);

    const codes = [];
    for (let i = 0; i < 4; i ++) {
      const code = this.solution_order.slice(i * 4, (i * 4) + 4);
      const letter = solution.solution[i];
      const image = CaptchaChallenge.getEncodedLetterImage(letter);
      codes.push({
        index: i,
        image,
        code,
      });
    }

    // shuffle while making sure the shuffled codes aren't the final answer
    let codeObjects;
    let codeStrings;
    do {
      codeObjects = randomShuffle(codes);
      codeStrings = codeObjects.map(code => code.code)
    }
    while (this.doInputCodesMatch(codeStrings));

    return codeObjects;
  };

  CaptchaChallenge.prototype.doInputCodesMatch = function (inputCodes) {
    const inputOrder = inputCodes.join('');
    return inputOrder === this.solution_order;
  };

  return CaptchaChallenge;
}
