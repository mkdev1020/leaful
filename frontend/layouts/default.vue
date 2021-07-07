<template>
  <div>
    <HelpCenter />
    <Upload />
    <Login />
    <Register />
    <Nuxt />
  </div>
</template>

<script>
import Login from '../components/Login';
import HelpCenter from '../components/help-center/HelpCenter';
import Register from '../components/auth/Register';
import Upload from "../components/upload/Upload";

export default {
  components: {
    Login,
    HelpCenter,
    Register,
    Upload
  },
  computed: {
    isAuthPromptShowing() {
      return this.$store.state.main.isAuthPromptShowing;
    },
  },
};
</script>

<style>
.auth-prompt {
  display: none;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.auth-prompt.showing {
  display: grid;
  background: rgba(0, 0, 0, 0.8);
}

.auth-prompt__box {
  width: 300px;
  height: 300px;
  display: grid;
  justify-content: center;
  align-items: center;
  background: lightblue;
}

.auth-prompt__inputs-container {
  display: grid;
  grid-gap: 10px;
}

.input-text {
  padding: 5px 8px;
}

html {
}

html,
body,
body > div,
body > div > div
{
  width: 100%;
  height: 100%;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}
</style>
