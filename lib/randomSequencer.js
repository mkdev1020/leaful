
const seedrandom = require('seedrandom');

module.exports = class RandomSequencer {

  constructor() {
    this.rng = new seedrandom();
  }

  initSeed(seed) {
    this.rng = new seedrandom(seed);
  }

  /**
   * This method becomes noticeably slower for large batches and/or large
   * offsets (~100K+). However, it performs wonderfully for getting data in
   * increments (batches) of 24, without losing any performance from large
   * `max` values.
   *
   * Moreover, this method has several advantages over other methods:
   * - guarantees no duplicates
   * - guarantees the desired number of results
   * - can be re-seeded instantly (i.e. no overnight seed column setting and
   *   indexing)
   * - most of the heavy-lifting is done on the server-side, which is obviously
   *   easier to scale than the database. (As a matter of fact, this could
   *   actually be done on the FRONT-END, which would spare the server entirely!)
   */
  getSequenceWithoutRepeats(length, max, offset = 0) {
    const newNumber = (max) => {
      return Math.floor(this.rng() * max + 1) - 1;
    }

    const chosen = new Set();
    const sequence = [];
    let index = 0;

    if (length > max) {
      throw new Error(`Length must be <= max.`);
    }

    if (offset >= max) {
      throw new Error(`Offset must be < max.`);
    }

    while (sequence.length < length) {
      const newNum = newNumber(max);
      if (!chosen.has(newNum)) {
        chosen.add(newNum);
        if (index >= offset) {
          sequence.push(newNum);
        }
        index += 1;
        if (index >= max) {
          break;
        }
      }
    }

    return sequence;
  }


}
