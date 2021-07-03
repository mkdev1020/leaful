<template>
  <div class="container">
    <div class="sidebar">
      <div>one</div>
      <div>one</div>
      <div>one</div>
      <div>one</div>
      <NuxtLink to="/test/secret">Go here!!!!!!!</NuxtLink>
      <a @click="showHelpCenter()">Help Center</a>
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
import {mapGetters} from 'vuex'
export default {
  computed: {
    ...mapGetters({
    })
  },
  data() {
    return {
    };
  },
  mounted() {
    this.$store.commit('register/SET_MODAL', true)
  },
  methods: {
    showHelpCenter() {
      this.$store.commit('register/SET_MODAL', true)
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
