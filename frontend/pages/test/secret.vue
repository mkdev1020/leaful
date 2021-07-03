<template>
  <div class="container">
    hola!
  </div>
</template>

<script>
export default {
  middleware: [
    // 'auth',
  ],
  async mounted() {
  },
  methods: {
  },
}
</script>

<style>
.container {
  background: pink;
  height: 100%;

  display: grid;
  grid-template-columns: 300px 1fr;
}

</style>
