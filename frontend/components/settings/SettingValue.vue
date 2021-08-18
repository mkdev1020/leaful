<template>
  <div>
    <div class="setting-title">
      {{ title }}
    </div>

    <div v-if="type === 'boolean'">
      <div>
        <label>
          <input type="checkbox" v-model="editValue">
          {{ editValue ? 'Enabled' : 'Disabled' }}
        </label>
      </div>
      <div>
        {{ description }}
      </div>
      <div>
        <button class="setting__update" :disabled="isUpdateDisabled" @click="update">
          Update
        </button>
      </div>
    </div>
    <div v-else-if="type === 'number'">
      <div>
        <input type="number" v-model.number="editValue">
      </div>
      <div>
        {{ description }}
      </div>
      <div>
        <button class="setting__update" :disabled="isUpdateDisabled" @click="update">
          Update
        </button>
      </div>
    </div>
    <div v-else-if="type === 'string-short'">
      <div>
        <input type="text" v-model="editValue">
      </div>
      <div>
        {{ description }}
      </div>
      <div>
        <button class="setting__update" :disabled="isUpdateDisabled" @click="update">
          Update
        </button>
      </div>
    </div>
    <div v-else-if="type === 'string'">
      <textarea :placeholder="description" v-model="editValue" />
      <div>
        <button class="setting__update" :disabled="isUpdateDisabled" @click="update">
          Update
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
      editValue: null,
    };
  },

  watch: {
    startValue(newValue, oldValue) {
      this.editValue = newValue;
    }
  },

  computed: {
    isUpdateDisabled() {
      return this.editValue === this.startValue;
    },
  },

  methods: {
    update() {
      this.$emit('update', this.editValue);
    },
  },

  mounted() {
    this.editValue = this.startValue;
  },

};
</script>
