<template>
  <modal
    style="z-index: 100;"
    close-button
    :class="{
      showing: showModal,
    }"
    @click="close"
    v-if="showModal"
  >
    <div class="login-modal-container">
      <div class="pro-tip">
        <div>
          <span class="msg-icn" v-html="instruction"></span>
        </div>
      </div>

      <div class="divider" />

      <div class="login-section">

        <div class="login-container" v-if="isSubmitted">
          <div class="title">
            Success!
          </div>

          <div class="success-message">
            Your new Learningful account has been created! To start downloading free resources and earn income by sharing yours, please <span class="check-mail">check your email</span>. We sent you a link, that you must use to sign in for first time.
          </div>
        </div>

        <div class="login-container" v-else>
          <fieldset
            class="inputs-container"
            :disabled="!formEnabled"
            :class="{
              showing: !captchaShowing,
            }"
          >
            <div class="title">Join Us!</div>
            <input
              id="name"
              type="text"
              placeholder="First and Last Name"
              class="input name"
              v-model.trim="$v.name.$model"
              :disabled="requestLimit.isExceeded"
              @blur="tryProgressingToEmail"
              @keydown="handleNameKeydown"
            >

            <input
              id="email-input"
              type="text"
              placeholder="Email Address"
              class="input email"
              v-model.trim="$v.email.$model"
              :class="{
                'input--error': emailCheckedAndNotRecognized,
              }"
              :disabled="requestLimit.isExceeded || !nameEnabled"
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
                By creating your account, you hereby agree to our? <a href="#">Terms and Condition</a>
              </div>
            </div>

          </fieldset>
          <captcha />
        </div>
      </div>
    </div>
  </modal>
</template>

<script>
import { mapGetters } from 'vuex'
import { validationMixin } from 'vuelidate';
import { required, minLength, email } from 'vuelidate/lib/validators';

import Captcha from '../Captcha';
import Modal from '../Modal';

export default {
  mixins: [ validationMixin ],
  components: {
    Captcha,
    Modal,
  },

  data() {
    return {
      proTip: {},

      name: '',
      email: '',
      password: '',

      emailChecked: false,
      isEmailRecognized: false,

      passwordType: 'password',
      isSubmitted: false,

      loading: false,
      invalidCredentials: false,
      successfulLogin: false,
      loginLinkStatus: '',
      instruction: `Your name is used on <b>Learningful</b> to identify you as the author of resources you publish`,
    };
  },

  validations: {
    name: {
      required,
    },
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
    ...mapGetters({
      showModal: 'register/getModalStatus'
    }),
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
    nameEnabled() {
      if (this.$v.name.$invalid) {
        return false
      } else {
        const str = this.name.split(' ')
        if(str.length < 2) {
          return false
        } else if ( str.length > 2) {
          let restr = this.name.split('/')
          if (restr.length === 2 && restr[1] !== '') {
            return true
          } else {
            return false
          }
        } else {
          return true
        }
      }

    },
    passwordEnabled() {
      return !this.$v.email.$invalid && !this.isEmailRecognized;
    },
    submitEnabled() {
      return !this.$v.$invalid;
    },
    requestLimit() {
      return this.$store.state.main.requestLimit;
    },
    emailCheckedAndNotRecognized() {
      return this.emailChecked && this.isEmailRecognized;
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
      // this.isEmailRecognized = await this.$sdk.isEmailRecognized(this.email);
      this.isEmailRecognized = false
      this.emailChecked = true;
    },

    async handleNameKeydown(event) {
      // tab key
      if (event.keyCode === 9) {
        event.preventDefault();
        event.stopPropagation();
        await this.tryProgressingToEmail();
      }
    },

    async handleEmailKeydown(event) {
      // tab key
      if (event.keyCode === 9) {
        event.preventDefault();
        event.stopPropagation();
        await this.tryProgressingToPassword();
      }
    },

    async tryProgressingToEmail() {
      if (this.$v.name.$invalid) {
        return;
      }

      document.getElementById('email-input').focus();
      if (!this.$v.name.$invalid) {
        const str = this.name.split(' ')
        if(str.length < 2) {
        } else if ( str.length > 2) {
          let restr = this.name.split('/')
          if (restr.length === 2 && restr[1] !== '') {
          } else {
          }
        } else {
          this.instruction = `Your email address must be validated and also functions as your <b>Learningful</b> username`
        }
      }
    },

    async tryProgressingToPassword() {
      if (this.$v.email.$invalid) {
        return;
      }

      await this.checkIfEmailExists();
      if (!this.isEmailRecognized) {
        this.instruction = `Your <b>Learningful</b> password should be unique to you. Create one you don't use elsewhere.`
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
        // await this.$sdk.authenticate({
        //   username: this.email,
        //   password: this.password,
        // });

        this.successfulLogin = true;

        // await new Promise(resolve => window.setTimeout(resolve, 500));
        // this.$sdk.finishAuthentication();
        this.isSubmitted = true
        this.instruction = `You did it! Yor are officially the newest member of <b>Learningful</b>.Woot! How cool is that?`
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

    close() {
      this.$store.commit('register/SET_MODAL', false)
    },
  },

  async mounted() {
  },

  watch: {

    name(val) {
      if (!this.name) {
        this.instruction = `<span style="color: #0066FF;" class="ins-error">Your <b>learningful</b> account, lets you download, share and publish teaching materials.</span>`
      } else if (this.name) {
        const str = this.name.split(' ')
        if(str.length < 2) {
          this.instruction = `<span style="color: #0066FF;" class="ins-error">To create <b>Learningful</b> account, type both a first name and last name, seperated by space.</span>`
        } else if ( str.length > 2) {
          let restr = this.name.split('/')
          if (restr.length === 2 && restr[1] !== '') {
            this.instruction = `Your name is used on <b>Learningful</b> to identify you as the author of resources you publish`
          } else {
            this.instruction = `<span style="color: #0066FF;" class="ins-error">To continue, please type a backslash / between your first and last name, as a demarcation.</span>`
          }
        } else {
          this.instruction = `Your name is used on <b>Learningful</b> to identify you as the author of resources you publish`
        }
      }
    },

    email(val) {
      console.log(val, this.$v.email.$invalid, this.$v.$invalid)
      if (this.$v.email.$invalid) {
        this.instruction = `<span style="color: #0066FF;">Your email address doesn't look right. Are you certain it has been formatted correctly?</span>`
      } else {
        this.instruction = `Your email address must be validated and also functions as your <b>Learningful</b> username`
      }
    },
    password(val) {
      if (this.$v.password.$invalid) {
        this.instruction = `<span style="color: #0066FF;">Your <b>Learningful</b> password must have atleast 1 number and be 8 character or more.</span>`
      } else {
        this.instruction = `Your <b>Learningful</b> password should be unique to you. Create one you don't use elsewhere.`
      }
    }
  }

}
</script>

<style scoped>

.login-modal-container {
  display: grid;
  grid-template-columns: 628px auto auto;
  /* border-radius: 5px;
  overflow: hidden; */
}

.divider {
  width: 10px;
  height: 100%;
  background: white;
}

.pro-tip {
  width: 628px;
  height: 458px;
  background: #C0DFFE;
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

.name {
  grid-column: 1 / 6;
  grid-row: 2;
}

.email {
  grid-column: 1 / 6;
  grid-row: 3;
}

.password-container {
  grid-column: 1 / 5;
  grid-row: 4;
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
  grid-row: 4;
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
  grid-row: 5;
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

.msg-icn {
  display: inline-block;
  position: relative;
  padding: 20px;
  top: 25px;
  width: 367px;
  right: -230px;
  min-height: 38px;
  font-size: 16px;
  font-family: 'Nunito', sans-serif;
  background: #FFFFFF;
  border-radius: 10px;
}
.msg-icn:before {
  content: "";
  position: absolute;
  display: block;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  clip-path: polygon(0% 105%, 0% 0%, 105% 0%, 105% 105%, 43px 105%, 43px 80%, 21px 80%, 21px 105%);
}
.msg-icn:after {
  content: "";
  position: absolute;
  display: block;
  width: 50px;
  height: 40px;
  background: #FFFFFF;
  top: calc(100% - 1px);
  left: 20px;
  box-sizing: border-box;
  clip-path: polygon(100% 3%, 23% 1%, 0 100%);
}

.ins-error {
  color: #0066FF !important;
}

.success-message {
  font-family: 'Nunito', sans-serif;
  font-weight: 400;
  font-size: 16px;
}

.check-mail {
  font-weight: 900;
  color: #0066FF;
}

</style>

