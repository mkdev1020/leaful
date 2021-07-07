<template>
  <div>
    <input type="file" hidden>
    <button type="button" @click="submit">Submit</button>
  </div>
</template>

<script>
export default {
  methods: {
    async submit() {
      const formData = new FormData();
      const fileField = document.querySelector('input[type="file"]');
      formData.append('short_title', 'abc123');
      formData.append('image', fileField.files[0]);

      const response = await this.$sdk.post('/help', formData);

      console.log(response);
    },
  },
  async mouted() {
  }
};

</script>
<style scoped>

</style>
