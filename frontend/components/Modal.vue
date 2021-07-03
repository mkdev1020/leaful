
<template>
  <div class="modal-base">
    <div class="modal-container">
      <div class="close-button" v-if="closeButton">
        <div class="close-button__box" @click="handleClick">
          <img src="/api/images/base/xbutton.svg">
        </div>
      </div>
      <div class="modal-inner-container">
        <div class="modal-inner-container-border" />
        <div class="modal-container__content">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.modal-base {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  opacity: 0;
  pointer-events: none;
  transition: 0.5s ease opacity;

  display: grid;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}

.modal-base.showing {
  opacity: 1;
  pointer-events: all;
}

.modal-container {
  margin: 0 auto;
  border-radius: 5px;
  border: 4px solid var(--col-captcha-verify-border-disabled);
  overflow: hidden;
  padding: 20px;
  background: white;
  position: relative;
}

.modal-inner-container {
  /* display: grid;
  grid-template-columns: 500px auto;
  border-radius: 5px;
  overflow: hidden; */

  border-radius: 5px;
  overflow: hidden;
  position: relative;
}

.modal-inner-container-border {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid var(--col-captcha-verify-border-disabled);
  z-index: 5;
}

.modal-container__content {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 10;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 45px;
  height: 45px;
  background: white;
  z-index: 12;
}

.close-button__box {
  position: absolute;
  right: 0;
  top  : 0;

  width : calc(100% - 5px);
  height: calc(100% - 5px);
  border-radius: 5px;
  display: grid;
  align-items: center;
  justify-content: center;
  background: var(--col-border);

  cursor: pointer;
}

.close-button__box img {
  width: 100%;
}

</style>

<script>
export default {
  props: {
    closeButton: {
      type: Boolean,
      defaultValue: false,
    },
  },
  computed: {
  },
  methods: {
    handleClick() {
      this.$emit('click');
    },
  },
};
</script>
