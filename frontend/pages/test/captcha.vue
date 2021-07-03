<template>
  <div class="container">
    {{ message }}
    <captcha />
  </div>
</template>

<style>
</style>

<script>
import Captcha from '../../components/Captcha';

export default {
  components: {
    Captcha,
  },
  data() {
    return {
      message: 'Waiting for captcha to be solved...',
    };
  },
  async mounted() {
    let response = await this.$sdk.post('/test/captcha', {
      requireCaptcha: true,
    });

    const responseJson = await response.json();
    this.message = responseJson.message;
  },
}
</script>
