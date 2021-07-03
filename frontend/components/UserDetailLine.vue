<template>
  <div class="user-details__detail">
    <div class="user-details__title">{{ name }}</div>
    <div class="user-details__value" :class="readonly ? '' : 'user-details__value--editable'">
      <div
        v-if="enabler"
        class="enable-text"
        :class="value ? 'enable-text--enabled' : 'enable-text--disabled'"
        @click="$emit('save', !value)"
      >
        {{ value ? 'Enabled' : 'Disabled' }}
      </div>
      <span v-else-if="!editing" @click="!readonly && startEditing()">
        <slot />
      </span>
      <div v-else class="user-details__edits">
        <input ref="input" v-model="edits">
        <button type="button" @click="save()">✅</button>
        <button type="button" @click="reset()">❌</button>
      </div>
    </div>
  </div>
</template>

<style>
.enable-text--disabled {
  color: var(--col-captcha-magenta);
}
</style>

<script>
export default {
  props: {
    readonly: {
      type: Boolean,
      default: false,
    },
    enabler: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      default: '',
    },
    value: {
      type: [String, Number, Boolean],
      default: '',
    },
  },

  data() {
    return {
      editing: false,
      edits: '',
    };
  },

  methods: {
    startEditing() {
      this.editing = true;
      this.edits = this.value;
      window.setTimeout(() => {
        this.$refs['input'].focus();
      });
    },
    save() {
      this.$emit('save', this.edits);
      this.editing = false;
    },
    reset() {
      this.$emit('reset', this.edits);
      this.editing = false;
    },
  },

};
</script>
