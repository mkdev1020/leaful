<template>
  <div class="detail-line__detail">
    <div class="detail-line__title">{{ name }}</div>
    <div class="detail-line__value" :class="readonly ? '' : 'detail-line__value--editable'">
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
      <div v-else class="detail-line__edits">
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

.detail-line {
  position: relative;
  width: 394px;
}

.detail-line__arrows {
  top: 40px;
  left: -40px;
  position: absolute;
  display: grid;
  grid-gap: 5px;
  padding : 5px;
  background: #e1f0ff;
}

.detail-line__arrow {
  border-radius: 5px;
  background: #4a80ff;
  --size: 20px;
  width : var(--size);
  height: var(--size);
  display: flex;
  padding: 5px;
  cursor: pointer;
}

.detail-line__arrow--down img {
  transform: rotate(180deg);
}

.detail-line__list {
  max-width: 394px;
  height: 130px;
  overflow: scroll;
}

.detail-line__detail {
  position: relative;
  border-bottom: 2px solid var(--col-captcha-verify-border-disabled);
  height: 19px;
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-line__title {
  position: absolute;
  top : 0;
  left: 0;
}

.detail-line__value {
  position: absolute;
  top  : 0;
  right: 0;
  font-weight: bold;
}

.detail-line__value--editable {
  color: var(--col-captcha-verify-text);
  cursor: pointer;
}

.detail-line__edits {
  display: flex;
  height: 20px;
}

.detail-line__edits button {
  padding: 2px;
  margin: 0;
  border: 1px solid black;
  display: flex;
  align-items: center;
  justify-content: center;
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
