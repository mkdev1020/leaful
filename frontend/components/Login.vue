<template>
  <modal
    style="z-index: 100;"
    close-button
    :class="{
      showing: isAuthPromptShowing,
    }"
    @click="close"
    v-if="isAuthPromptShowing"
  >
    <div class="login-modal-container">
      <div class="pro-tip">
        <NuxtLink :to="proTipLinkUrl">
          <img :src="proTip.image_locator">
        </NuxtLink>
      </div>

      <div class="divider" />

      <div class="login-section">
        <div class="login-container" >
          <fieldset
            class="inputs-container"
            :disabled="!formEnabled"
            :class="{
              showing: !captchaShowing,
            }"
          >
            <div class="title">
              Login
            </div>
            <input
              id="email-input"
              type="text"
              placeholder="Email Address"
              class="input email"
              v-model.trim="$v.email.$model"
              :class="{
                'input--error': emailCheckedAndNotRecognized,
              }"
              :disabled="requestLimit.isExceeded"
              @blur="tryProgressingToPassword"
              @keydown="handleEmailKeydown"
            >

            <div class="password-container">
              <input
                id="password-input"
                :type="passwordType"
                placeholder="Password"
                class="input password"
                v-model="$v.password.$model"
                :class="{
                  'input--error': invalidCredentials,
                }"
                :disabled="!passwordEnabled"
                @keyup.enter="submitEnabled && submit()"
              >
              <button
                class="password__eye"
                :class="{
                  'password__eye--visible': passwordType !== 'password',
                }"
                :disabled="!passwordEnabled"
                @click="togglePasswordVisible"
              >
                <template v-if="passwordType === 'password'">
                  <i class="icon-password-eye" />
                </template>
                <template v-else>
                  <i class="icon-password-eye" />
                </template>
              </button>
            </div>

            <button
              type="button"
              class="submit input"
              :disabled="!submitEnabled"
              @click="submit"
            >
              <i id="icon-check" class="icon-check" />
            </button>

            <div class="form-message">
              <div class="error" v-if="requestLimit.isExceeded">
                <template v-if="requestLimit.isLocked">
                  Account Locked. See Email To Unlock.
                </template>
                <template v-else>
                  Please Wait <b>{{ requestLimit.secondsRemaining }}</b> Seconds.
                </template>
              </div>

              <div class="" v-else-if="loginLinkStatus === 'sending'">
                Sending...
              </div>

              <div class="" v-else-if="loginLinkStatus === 'sent'">
                <b>Sent!</b> Check Your Email.
              </div>

              <div class="" v-else-if="loginLinkStatus === 'failed'">
                <b>Error L1!</b> Could not send link.
              </div>

              <div class="error" v-else-if="invalidCredentials">
                Invalid.
                <button
                  class="link-button"
                  @click="sendLoginLink"
                >
                  Email a Login Link?
                </button>
              </div>

              <div class="error" v-else-if="emailCheckedAndNotRecognized">
                Email Address <b>Not Recognized</b>
              </div>

              <div class="" v-else-if="successfulLogin">
                <b>Success!</b> Signing You In...
              </div>

              <div class="" v-else>
                No Account? <nuxt-link to="/test/sign-up">Sign Up</nuxt-link>
              </div>
            </div>

          </fieldset>
          <captcha />
        </div>
      </div>
    </div>
  </modal>
</template>

<style>
/* @import url('../assets/global.css'); */
</style>

<style scoped>

.login-modal-container {
  display: grid;
  grid-template-columns: 500px auto auto;
  /* border-radius: 5px;
  overflow: hidden; */
}

.divider {
  width: 10px;
  height: 100%;
  background: white;
}

.pro-tip a {
  display: flex;
}

.pro-tip img {
  width: 100%;
}

.login-section {
  display: grid;
  align-items: center;
  justify-content: center;
  padding-left: 50px;
  padding-right: 50px;
  /* border: 4px solid var(--col-captcha-verify-border-disabled);
  border-left: none; */
  margin-left: 10px;
  position: relative;
}

.login-container {
  width: 280px;
  margin: 30px auto;
  position: relative;
  background: white;
}

.inputs-container {
  opacity: 0;
  transition: 0.5s ease all;
}

.inputs-container.showing {
  opacity: 1;
}

.title {
  font-family: "Fredoka One";
  font-size: 40px;
  margin-bottom: 8px;
  color: var(--col-title);
}

fieldset {
  height: 100%;
  margin: 0;
  border: 0;
  padding: 0;
  display: grid;
  grid-gap: 8px;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: 48px 48px 48px 48px;
}

.input {
  border: 4px solid var(--col-border);
  border-radius: 5px;
  font-size: 16px;
  font-family: "Nunito", sans-serif;
  font-weight: 600;
  padding: 0 15px;
  color: var(--col-accent);
}

.input::placeholder {
  color: var(--col-input-placeholder);
}

.input[disabled] {
  background: var(--col-disabled);
}

.input--error {
  border: 4px solid var(--col-accent);
}

.title {
  grid-column: 1 / 6;
  grid-row: 1;
}

.email {
  grid-column: 1 / 6;
  grid-row: 2;
}

.password-container {
  grid-column: 1 / 5;
  grid-row: 3;
  position: relative;
}

.password {
  width: 100%;
  height: 100%;
}

.password__eye {
  position: absolute;
  top: 0;
  right: 0;
  width : 48px;
  height: 48px;
  margin: 0;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
}

.password__eye .icon-password-eye {
  font-size: 24px;
  color: var(--col-border);
}

.password__eye--visible .icon-password-eye {
  color: var(--col-accent);
}

.submit {
  grid-column: 5 / 6;
  grid-row: 3;
  padding: 0;
  background: white;
  border-color: var(--col-accent);
  cursor: pointer;
  font-size: 20px;
}

.submit[disabled] {
  background: var(--col-border);
  border-color: var(--col-border);
  color: white;
}

.form-message {
  grid-column: 1 / 6;
  grid-row: 4;
  font-family: "Nunito", sans-serif;
  font-weight: 400;
  text-align: right;
  font-size: 16px;
}

.form-message b,
.form-message a
{
  color: var(--col-accent);
  font-weight: 900;
}

.link-button {
  font-family: "Nunito", sans-serif;
  font-weight: 900;
  color: var(--col-accent);
  text-decoration: underline;
  border: 0;
  background: inherit;
  font-size: inherit;
  cursor: pointer;
  margin: 0;
  padding: 0;
  display: inline;
}

</style>

<script>
import { validationMixin } from 'vuelidate';
import { required, minLength, email } from 'vuelidate/lib/validators';

import Captcha from './Captcha';
import Modal from './Modal';

export default {
  mixins: [ validationMixin ],
  components: {
    Captcha,
    Modal,
  },

  data() {
    return {
      proTip: {},

      email: '',
      password: '',

      emailChecked: false,
      isEmailRecognized: false,

      passwordType: 'password',

      loading: false,
      invalidCredentials: false,
      successfulLogin: false,
      loginLinkStatus: '',
    };
  },

  validations: {
    email: {
      required,
      email,
    },
    password: {
      required,
      minLength: minLength(8),
    }
  },
  computed: {
    isAuthPromptShowing() {
      return this.$store.state.main.isAuthPromptShowing;
    },
    formEnabled() {
      return (
        !this.successfulLogin &&
        !this.captchaShowing &&
        !this.requestLimit.isExceeded &&
        !this.loading
      );
    },
    passwordEnabled() {
      return !this.$v.email.$invalid && this.isEmailRecognized;
    },
    submitEnabled() {
      return !this.$v.$invalid;
    },
    requestLimit() {
      return this.$store.state.main.requestLimit;
    },
    emailCheckedAndNotRecognized() {
      return this.emailChecked && !this.isEmailRecognized;
    },
    captchaShowing() {
      return this.$store.state.captcha.isShowing;
    },
    proTipLinkUrl() {
      const id = this.proTip.id || '';
      return `/help-center/${id}`;
    },
  },
  methods: {
    async checkIfEmailExists() {
      this.emailChecked = false;
      this.isEmailRecognized = await this.$sdk.isEmailRecognized(this.email);
      this.emailChecked = true;
    },

    async handleEmailKeydown(event) {
      // tab key
      if (event.keyCode === 9) {
        event.preventDefault();
        event.stopPropagation();
        await this.tryProgressingToPassword();
      }
    },

    async tryProgressingToPassword() {
      if (this.$v.email.$invalid) {
        return;
      }

      await this.checkIfEmailExists();
      if (this.isEmailRecognized) {
        document.getElementById('password-input').focus();
      }
    },

    togglePasswordVisible() {
      this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
    },

    async submit() {
      try {
        this.loading = true;
        this.invalidCredentials = false;
        await this.$sdk.authenticate({
          username: this.email,
          password: this.password,
        });

        this.successfulLogin = true;

        await new Promise(resolve => window.setTimeout(resolve, 500));
        this.$sdk.finishAuthentication();
      }
      catch (e) {
        this.invalidCredentials = true;
        this.loading = false;
      }
    },

    async sendLoginLink() {
      this.loginLinkStatus = 'sending';
      try {
        await this.$sdk.sendLoginLink(this.email);
        this.loginLinkStatus = 'sent';
      } catch (e) {
        this.loginLinkStatus = 'failed';
      }
    },

    async initProTip() {
      const proTip = await this.$sdk.getRandomProTip();
      this.proTip = proTip;
      document.documentElement.style.setProperty('--col-accent', this.proTip.accent_color);
    },

    close() {
      this.$store.commit('main/set', {
        isAuthPromptShowing: false,
        postAuthRedirect: null,
      });
    },

  },

  async mounted() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'main/promptAuthentication' && state.main.isAuthPromptShowing) {
        // document.getElementById('email-input').focus();
      }
    });

    await this.initProTip();
  },

}
</script>
