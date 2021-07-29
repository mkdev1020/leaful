import Vue from "vue";

import currencyFormatter from 'currency-formatter'
import { DateTime } from 'luxon';

function formatCurrency(value) {
  value = Number(value)
  return currencyFormatter.format(value, { code: 'USD' })
}

Vue.filter('currency', (value) => {
  return formatCurrency(value);
})

Vue.filter('currencyCents', (value) => {
  return formatCurrency(value / 100);
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

Vue.filter('date', (value, format = 'yyyy-MM-dd') => {
  return DateTime.fromISO(value).toFormat(format);
})

Vue.filter('capitalize', (value) => {
  return value[0].toUpperCase() + value.slice(1);
})
