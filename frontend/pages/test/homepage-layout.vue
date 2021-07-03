<template>
  <div class="container">
    <div class="sidebar" align="center">
      <div>one</div>
      <div>one</div>
      <div>one</div>
      <div>one</div>
      <div><NuxtLink to="/test/secret">Go here!!!!!!!</NuxtLink></div>
      <div><a @click="showHelpCenter()">Help Center</a></div>
      <div><a @click="showUploadModal()">Upload</a></div>
    </div>
    <div class="main">
      <template v-for="i in 10">
        <Cell2 :key="i" />
      </template>
    </div>
  </div>
</template>

<style>
</style>

<script>
export default {
  data() {
    return {
    };
  },
  methods: {
    showHelpCenter() {
      this.$store.commit('help-center/SET_HELP_CENTER_MODAL', true)
    },
    showUploadModal(){
      this.$store.commit('upload/SET_UPLOAD_MODAL', true)
    }
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

.sidebar {
  background: #1d272c;
  color : white;
}

.main {
  display: flex;
  flex-wrap: wrap;
  /* display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr; */
  align-content: flex-start;
  /* gap: 10px; */

  overflow-y: scroll;
  background: lightslategray;
  padding: 10px;
}

</style>
