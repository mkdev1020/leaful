
class PatternLock {

  constructor() {
    this.sizeX = 5;
    this.sizeY = 5;

    this.initSequence();
  }

  initSequence() {
    this.sequence = [];
    this.chosenCoordinates = new Set();
  }

  getCoordIndex(coord) {
    const row = coord[1];
    return coord[0] + row * this.sizeY;
  }

  getCoordFriendlyIndex(coord) {
    return this.getCoordIndex(coord) + 1;
  }

  setGrid(sizeX, sizeY) {
    this.sizeX = sizeX;
    this.sizeY = sizeY;
  }

  getAdjacentCoordinates(coord) {
    const coords = [];
    const [x, y] = coord;

    if ((x - 1) >= 0) {
      coords.push([x - 1, y]);
    }

    if ((x + 1) < this.sizeX) {
      coords.push([x + 1, y]);
    }

    if ((y - 1) >= 0) {
      coords.push([x, y - 1]);
    }

    if ((y + 1) < this.sizeY) {
      coords.push([x, y + 1]);
    }

    return coords;
  }

  wasCoordinateAlreadyChosen(coord) {
    return this.chosenCoordinates.has(coord.join(','));
  }

  getValidMoves(coord) {
    const valid = [];
    const adjacentCoordinates = this.getAdjacentCoordinates(coord);
    for (const coord of adjacentCoordinates) {
      if (!this.wasCoordinateAlreadyChosen(coord)) {
        valid.push(coord);
      }
    }
    return valid;
  }

  addCoordinate(coord) {
    this.sequence.push(coord);
    this.chosenCoordinates.add(coord.join(','));
  }

  getRandomSequenceCandidate() {
    this.initSequence();

    const endPos = [this.sizeX - 1, this.sizeY - 1];

    let posX = 0;
    let posY = 0;
    let coord = [posX, posY];
    this.addCoordinate(coord);

    while (true) {
      let coordChoices = this.getValidMoves(coord);
      if (coordChoices.length === 0) {
        return null;
      }

      coord = randomChoice(coordChoices);
      this.addCoordinate(coord);

      [posX, posY] = coord;
      if (posX == endPos[0] && posY == endPos[1]) {
        return this.sequence;
      }
    }
  }

  getRandomSequence() {
    while (true) {
      const seq = this.getRandomSequenceCandidate();
      if (seq !== null) {
        return seq;
      }
    }
  }

}

module.exports.PatternLock = PatternLock;

function randomChoice(arr) {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

function setDifference(a, b) {
  return new Set(Array.from(a).filter(item => !b.has(item)));
}

function areCoordArraysEquivalent(a, b) {
  const setA = new Set(a.map(coord => coord.join(',')));
  const setB = new Set(b.map(coord => coord.join(',')));

  const setDiff = setDifference(setA, setB);
  return setDiff.size === 0;
}

function assert(assertion) {
  if (assertion == false) {
    throw new Error(`FAILED ASSERTION!`);
  }
}

function runTests() {
  const lock = new PatternLock();
  lock.setGrid(5, 5);

  assert(areCoordArraysEquivalent(
    lock.getAdjacentCoordinates([0, 0]),
    [ [0,1], [1,0] ]
  ));

  assert(areCoordArraysEquivalent(
    lock.getAdjacentCoordinates([1, 1]),
    [ [1,0], [0,1], [2,1], [1,2] ]
  ));

  assert(areCoordArraysEquivalent(
    lock.getAdjacentCoordinates([4, 0]),
    [ [3,0], [4,1] ]
  ));

  assert(areCoordArraysEquivalent(
    lock.getAdjacentCoordinates([4, 1]),
    [ [4,0], [3,1], [4,2] ]
  ));

  assert(areCoordArraysEquivalent(
    lock.getAdjacentCoordinates([0, 2]),
    [ [0,1], [0,3], [1,2] ]
  ));

  assert(areCoordArraysEquivalent(
    lock.getAdjacentCoordinates([2, 2]),
    [ [1,2], [2,1], [2,3], [3,2] ]
  ));

  assert(areCoordArraysEquivalent(
    lock.getAdjacentCoordinates([2, 4]),
    [ [1,4], [2,3], [3,4] ]
  ));

  assert(areCoordArraysEquivalent(
    lock.getAdjacentCoordinates([4, 4]),
    [ [3,4], [4,3] ]
  ));
}

function drawCircle(context, centerX, centerY, radius) {
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  context.fill();
}

function showPattern(lock) {
  const mult = 100;
  const offset = mult / 2;

  const canvas = document.getElementById('canvas');
  canvas.width  = lock.sizeX * mult;
  canvas.height = lock.sizeY * mult;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#dddddd';
  ctx.fillRect(0, 0, lock.sizeX * mult, lock.sizeY * mult);

  ctx.fillStyle = 'black';
  for (let x = 0; x < lock.sizeX; x++) {
    for (let y = 0; y < lock.sizeY; y++) {
      drawCircle(ctx, x * mult + offset, y * mult + offset, 10);
    }
  }

  ctx.strokeStyle = '#00aa99';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.lineCap = 'round';
  ctx.moveTo(offset, offset);
  const seq = lock.sequence;
  for (let i = 0; i < seq.length; i++) {
    const coord = seq[i];
    ctx.lineTo(coord[0] * mult + offset, coord[1] * mult + offset);
    ctx.stroke();
  }
}

// runTests();
