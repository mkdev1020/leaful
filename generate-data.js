
const lines = [];
for (let i = 1; i < 32; i++) {
  let dateDay = i.toString();
  if (dateDay.length < 2) {
    dateDay = `0${dateDay}`;
  }

  const date = `2021-01-${dateDay}`;

  const numbers = [];
  for (let n = 0; n < 17; n++) {
    const randomNum = Math.round(Math.random() * 100);
    numbers.push(randomNum);
  }

  const numberString = numbers.join(',\t');
  const line = `('${date}', ${numberString})`;
  lines.push(line);
}

console.log(lines.join(',\n') + '\n;');
