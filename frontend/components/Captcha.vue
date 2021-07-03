<template>
  <div
    class="captcha-container"
    :class="{
      'captcha-showing': captchaShowing,
    }"
  >
    <div>
      <div class="captcha-clue">{{ challenge.clue }}</div>

      <draggable
        class="captcha-inputs-container"
        v-model="captchaInputs"
        group="captcha-inputs"
      >
        <div
          class="captcha-input"
          :class="`captcha-input-index-${captchaInput.index}`"
          v-for="captchaInput in captchaInputs"
          :key="captchaInput.code"
        >
          <img :src="encodeImage(captchaInput.image)">
        </div>
      </draggable>

      <div class="captcha-directions">Drag and drop the letters.</div>

      <div class="captcha-verify-row">
        <div class="captcha-verify-message" v-if="$store.state.captcha.checking">
          Checking...
        </div>
        <div class="captcha-verify-message" v-else-if="$store.state.captcha.checked && $store.state.captcha.success">
          Correct!
        </div>
        <div class="captcha-verify-message" v-else-if="$store.state.captcha.checked && !$store.state.captcha.success">
          Incorrect!
        </div>
        <button
          class="captcha-verify-button"
          :disabled="!changed"
          @click="submitCaptcha"
          v-else
        >
          Verify
        </button>
      </div>
    </div>
  </div>
</template>

<style>
@import url('../assets/globals.css');
</style>

<style scoped>
.captcha-container {
  width: 100%;
  height: 100%;
  left: 0px;
  top: 200px;
  opacity: 0;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: inherit;
  transition: 0.5s ease all;
}

.captcha-container.captcha-showing {
  top: 0px;
  opacity: 1;
}

.captcha-clue {
  /* Nunito 20pt 900 weight #FF2b4C */
  font-family: "Nunito";
  font-weight: 900;
  font-size: 20px;
  color: var(--col-captcha-title);
  margin-bottom: 10px;
}

.captcha-directions {
  /* Nunito 18pt 400 weight #000000 */
  font-family: "Nunito";
  font-weight: 400;
  font-size: 18px;
  color: black;
  margin-top: 10px;
  text-align: center;
}

.captcha-verify-row {
  height: 44px;
  margin-top: 10px;
  text-align: right;
}

.captcha-verify-button {
  /* Captcha "Verify" button text is Nunto 18pt 900 weight #DADDE0. Button
   * itself is 104 x 44 pixels, 96 x 36 interior. 4 pixel border #DADDE0, 5
   * pixel corner radius. Should be locked until the user moves at least one
   * letter tile in the puzzle. When unlocked, the mouse over state of the text
   * and border can be #258AFF, with the border having 50% opacity. */

  font-family: "Nunito";
  font-weight: 900;
  font-size: 18px;
  width: 104px;
  height: 44px;
  border: 4px solid black;
  color: black;
  border-radius: 5px;
  cursor: pointer;
  background: white;
}

.captcha-verify-button:hover {
  color: var(--col-captcha-verify-text);
  border-color: var(--col-captcha-verify-border);
}

.captcha-verify-button[disabled] {
  color: var(--col-captcha-verify-border-disabled);
  border-color: var(--col-captcha-verify-border-disabled);
}

.captcha-verify-message {
  font-family: "Nunito";
  font-weight: 900;
  font-size: 18px;
  color: var(--col-captcha-verify-border-disabled);
}

.captcha-inputs-container {
  width: 100%;
  display: grid;
  grid-gap: 10px;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  cursor: pointer;
}

.captcha-input {
  display: flex;
  border-radius: 5px;
  border: 4px solid black;
  overflow: hidden;
}

.captcha-input-index-0 {
  background: var(--col-captcha-red);
}

.captcha-input-index-1 {
  background: var(--col-captcha-yellow);
}

.captcha-input-index-2 {
  background: var(--col-captcha-cyan);
}

.captcha-input-index-3 {
  background: var(--col-captcha-magenta);
}

.captcha-input img {
  width: 100%;
}
</style>

<script>
import draggable from 'vuedraggable';

export default {
  components: {
    draggable,
  },

  data() {
    return {
      changed: false,
    };
  },

  methods: {
    encodeImage(data) {
      const encoded = window.btoa(data);
      return `data:image/svg+xml;base64, ${encoded}`;
    },

    async submitCaptcha() {
      await this.$sdk.replayRequestBlockedByCaptcha();
    },
  },

  computed: {
    challenge() {
      return this.$store.state.captcha.challenge || {};
    },

    captchaShowing() {
      return this.$store.state.captcha.isShowing;
    },

    captchaInputs: {
      get() {
        return this.$store.state.captcha.inputCodes;
      },
      set(codes) {
        this.changed = true;
        this.$store.commit('captcha/updateCaptchaInputCodes', codes)
      }
    }
  }
};
</script>
