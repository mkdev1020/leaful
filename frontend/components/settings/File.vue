<template>
  <div>
    <div class="setting-title">
      {{ title }}
    </div>
    <div>
      <div v-if="!cleared || file">
        <div>{{ fileBaseName }}</div>
        <button type="button" @click="clear">x</button>
      </div>
      <div v-else>
        <input type="file" @change="onFileChange">
      </div>
      <div>
        {{ description }}
      </div>
      <div>
        <button class="setting__update" :disabled="isUpdateDisabled" @click="update">
          Upload
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {

    type: {
      type: String,
      default: 'number',
    },
    startValue: {
      type: [Object, String, Number, Boolean],
      default: 'number',
    },
    title: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },

  },

  data() {
    return {
      file: null,
      cleared: false,
    };
  },

  watch: {
    startValue(newValue, oldValue) {
      this.file = null;
      this.cleared = false;
    }
  },

  computed: {
    isUpdateDisabled() {
      return !this.file;
    },
    fileBaseName() {
      if (this.file) {
        return this.file.name;
      }
      const parts = this.startValue.split('/');
      return parts[parts.length - 1];
    },
  },

  methods: {
    update() {
      this.$emit('update', this.file);
    },

    onFileChange(event) {
      this.file = event.target.files[0];
    },

    clear() {
      this.cleared = true;
      this.file = null;
    },
  },

  mounted() {
  },

};
</script>
