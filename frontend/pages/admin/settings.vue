<template>
  <div>
    <div class="info-line">
      <div v-if="!infoLineText">
      </div>
      <div v-else v-html="infoLineText" />
    </div>

    <div class="divider-h" />
    <div class="stats-strip">
      <div class="stats-strip__content">

        <div class="stats-strip__divider" />
        <div class="stats-strip__divider" />
        <div class="stats-strip__divider" />

      </div>
    </div>
    <div class="divider-h" />

    <div class="bottom-row">
      <div style="float: left">
        Bottom text here
      </div>
      <div style="float: right">
        <a href="#" style="color: #d0d0da; font-weight: bold">
          Sign Out
        </a>
      </div>
    </div>

  </div>
</template>

<script>

export default {
  data() {
    return {
      infoLineText: '',
      infoLineTimeout: null,
    };
  },
};

</script>
