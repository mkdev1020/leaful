<template>
  <div class="cell-container">
    <svg viewBox="0 0 1 1"></svg>
    <div class="cell">
      <img src="/test-3.jpg" class="resource-cover">
    </div>
  </div>
</template>

<style>

.cell-container {
  display: grid;
  width: 100%;
}

@media screen and (min-width: 600px) {
  .cell-container {
    width: 50%;
  }
}

@media screen and (min-width: 750px) {
  .cell-container {
    width: 33.33%;
  }
}

@media screen and (min-width: 1000px) {
  .cell-container {
    width: 25%;
  }
}

.cell-container > * {
  grid-area: 1/1;
}

.cell {
  margin: 5px;
  border: 2px solid black;
  background: white;
  box-sizing: border-box;

  display: grid;
  align-items: center;
  justify-content: center;
}

.cell__content {
  background: gold;
}

.resource-cover {
  height: 75%;
  max-width: 95%;
  box-shadow: -4px 4px 0px rgba(0, 0, 0, 0.5);
  display: block;
}

</style>
