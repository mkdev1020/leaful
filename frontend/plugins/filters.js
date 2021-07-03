import Vue from "vue";

import currencyFormatter from 'currency-formatter'

Vue.filter('currency', (value) => {
  value = Number(value)
  return currencyFormatter.format(value, { code: 'USD' })
})

function getUnitForNumber(num) {
  const units = [
    { min: 1000000000, unit: 'B' },
    { min: 1000000,    unit: 'M' },
    { min: 1000,       unit: 'K' },
  ];
  for (const level of units) {
    if (num >= level.min) {
      return level;
    }
  }
  return { min: 1, unit: '' };
}

Vue.filter("largeNumberDisplay", (num) => {
  const unit = getUnitForNumber(num);
  const multiple = num / unit.min;
  return `${multiple}${unit.unit}`;
});
