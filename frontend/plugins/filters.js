import Vue from "vue";

import currencyFormatter from 'currency-formatter'
import { DateTime } from 'luxon';

export function filterCurrency(value) {
  value = Number(value)
  return currencyFormatter.format(value, { code: 'USD' })
}

Vue.filter('currency', filterCurrency)

export function filterCurrencyCents(value) {
  return filterCurrency(value / 100);
}

Vue.filter('currencyCents', filterCurrencyCents)

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

export function filterLargeNumberDisplay(num) {
  const unit = getUnitForNumber(num);
  const multiple = num / unit.min;
  return `${multiple}${unit.unit}`;
}

Vue.filter("largeNumberDisplay", filterLargeNumberDisplay);

export function filterDate(value, format = 'yyyy-MM-dd') {
  return DateTime.fromISO(value).toFormat(format);
}

Vue.filter('date', filterDate)

export function filterCapitalize(value) {
  return value[0].toUpperCase() + value.slice(1);
}

Vue.filter('capitalize', filterCapitalize)

export function filterPercentage(value, decimals=2) {
  const percValue = (value * 100);
  if (decimals === null) {
    return `${percValue}%`;
  }
  const multiplier = Math.pow(10, decimals);
  const rounded = Math.round(percValue * multiplier) / multiplier;
  return `${rounded}%`;
}

Vue.filter('percentage', filterPercentage);
