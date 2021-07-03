<template>
  <div class="cell">
    <div class="cell__content" />
  </div>
</template>

<style>

.cell {
  border: 2px solid black;

  background: white;
  box-sizing: border-box;
  border: 1px dashed;
  overflow: auto;
  max-width: 100%;
  /* height: calc(100vh - 16px); */
  /* height: 100px; */
  width: 25%;
}

.cell__content {
  width: 100%;
  /* padding-bottom: 75%; */
  padding-bottom: 100%;

  background: gold;
}

</style>
