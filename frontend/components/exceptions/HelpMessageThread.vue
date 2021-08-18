
<template>

  <div style="width: 100%;">
    <template v-if="!fullMode">
      <div class="message">
        <div class="message__top-bar">
          <img
            :src="user.avatar_locator"
            class="message__user-from"
          >
          <span>
            &nbsp;<b>
            {{ user.first_name }}
            {{ user.last_name }}
          </b>
          </span>


          <div class="message__nav">
            <span class="message__nav-text" v-if="responseBoxShowing">
              {{ todayISO | date('LLLL d, y') }}
            </span>
            <span class="message__nav-text" v-else-if="supportMessage">
              {{ supportMessage.created_at | date('LLLL d, y') }}
            </span>

            <button :class="['help-message-navigate-button', 'arrow-up', !canDecrement() ? 'disabled-btn-up': '']"
                    :disabled="!canDecrement()"
                    @click="previousMessage">
            </button>
            <button
              class="help-message-navigate-button mod-sign-btn"
              v-if="isAdmin && isLastMessage"
              :disabled="responseBoxShowing"
              @click="() => { responseBoxShowing = true }">
              %
            </button>
            <button
              :class="['help-message-navigate-button', 'arrow-down', !canIncrement() ? 'disabled-btn-down': '']"
              v-else
              :disabled="!canIncrement()"
              @click="nextMessage">
            </button>
          </div>

        </div>

        <div class="message__content" v-if="!responseBoxShowing && supportMessage">
          "{{ supportMessage.message }}"
        </div>

        <div class="message__bottom-bar" v-if="!responseBoxShowing">
          <span class="message__skip">
            <span v-if="!isAdmin">
              <a class="link" @click="skip">
                Skip
              </a>
            </span>
          </span>
          <span class="message__count">
            Message <b>{{ supportMessageIndex + 1 }}</b> of
            <b>{{ supportMessages.length }}</b>
          </span>
        </div>

        <div class="message__response-box" v-if="responseBoxShowing">
          <textarea
            class="message__response-box-textarea st-response-box"
            placeholder="Type Response"
            v-model="responseBody"
          />
          <div class="message__response-box-buttons">
            <!--        <button class="n-btn" :disabled="!canSkip" @click="skip">&lt;</button>-->
            <button class="n-btn" @click="showFullResponseBox">&lt;</button>
            <button class="n-btn" @click="resolve">N</button>
            <button class="submit-btn" @click="submitResponse">Submit</button>
          </div>
        </div>

      </div>
    </template>
    <template v-else>
      <div class="message-full-mode">

        <div class="message__response-box" v-if="responseBoxShowing">
          <textarea
            class="message__response-box-textarea st-response-box"
            placeholder="Type Response"
            v-model="responseBody"
          />
          <div class="message__response-box-buttons">
            <!--        <button class="n-btn" :disabled="!canSkip" @click="skip">&lt;</button>-->
            <button class="n-btn" @click="minimizeResponseBox">&gt;</button>
            <button class="n-btn" @click="resolve">N</button>
            <button class="submit-btn" @click="submitResponse">Submit</button>
          </div>
        </div>

      </div>
    </template>
  </div>


</template>


<script>
import { DateTime } from 'luxon';

export default {
  props: {
    supportMessages: {
      type: Array,
      default: [],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    threadIndex: {
      type: Number,
      default: 0,
    },
    threadIndexMax: {
      type: Number,
      default: 0,
    },
    fullMode: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      responseBoxFullMode: false,
    };
  },

  computed: {
    user() {
      if (this.supportMessage) {
        return this.supportMessage.user;
      }
      return this.$store.state.main.user;
    },

    responseBoxShowing: {
      get() {
        return this.isAdmin && (
          this.$store.state.exceptions.responseBoxShowing
          || !this.supportMessage
        );
      },
      set(value) {
        this.$store.commit('exceptions/set', {
          responseBoxShowing: value,
        })
      },
    },

    responseBody: {
      get() {
        return this.$store.state.exceptions.responseBody;
      },
      set(value) {
        this.$store.commit('exceptions/set', {
          responseBody: value,
        })
      },
    },

    supportMessage() {
      return this.supportMessages[this.supportMessageIndex];
    },

    storeIndex() {
      if (this.isAdmin) {
        return 'supportMessageIndexAdmin';
      }
      return 'supportMessageIndexTeacher';
    },

    supportMessageIndex: {
      get() {
        return this.$store.state.exceptions[this.storeIndex];
      },
      set(value) {
        this.$store.commit('exceptions/set', {
          [this.storeIndex]: value,
        })
      },
    },

    isLastMessage() {
      return this.supportMessageIndex === this.supportMessages.length - 1;
    },

    todayISO() {
      return DateTime.now().toISO();
    },

    canSkip() {
      return this.threadIndex < this.threadIndexMax;
    },
  },

  methods: {
    canIncrement() {
      return this.supportMessageIndex < this.supportMessages.length - 1;
    },
    canDecrement() {
      if (this.responseBoxShowing) {
        return this.supportMessages.length > 0;
      }
      return this.supportMessageIndex !== 0;
    },

    nextMessage() {
      this.supportMessageIndex += 1;
    },

    previousMessage() {
      if (this.responseBoxShowing) {
        this.responseBoxShowing = false;
        return;
      }
      this.supportMessageIndex -= 1;
    },

    skip() {
      this.$emit('skip');
      this.clear();
    },

    submitResponse() {
      this.$emit('submitResponse', this.responseBody);
      this.clear();
    },

    resolve() {
      this.$emit('resolve');
      this.clear();
    },

    clear() {
      this.supportMessageIndex = 0;
      this.responseBoxShowing = false;
      this.responseBody = '';
    },

    showFullResponseBox() {
      this.$emit('responseBoxFullMode', true)
      this.responseBoxFullMode = true
    },

    minimizeResponseBox() {
      this.$emit('responseBoxMinimizeMode', true)
      this.responseBoxFullMode = false
    }
  },

};
</script>


<style scoped>
.message {
  width: 450px;
}

.message__top-bar {
  display: grid;
  justify-content: center;
  align-items: center;
  grid-template-columns: 25px 1fr 1fr 25px;
}

.message__user-from {
  width: 100%;
  margin-right: 5px;
}

.message__nav {
  display: flex;
  flex-direction: row;
  margin-right: -25px;
  align-items: center;
}

.message__nav-text {
  width: 100%;
  text-align: right;
  font-weight: 900;
  color: #8FA4BF;
}

.message__content {
  text-indent: 15px;
  min-height: 75px;
  max-height: 75px;
  overflow-y: scroll;
  margin: 6px 0;
}

.message__response-box {
  display: flex;
  width: 100%;
  height: 100px;
  position: relative;
  margin-top: 10px;
}

.message__response-box-textarea {
  width: 100%;
  height: 100%;
  resize: none;
}

.message__response-box-buttons {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 10px;
}

.message__bottom-bar {
  display: flex;
}

.message__skip {
  width: 100%;
}

.message__count {
  white-space: nowrap;
}

.st-response-box {
  border-radius: 5px;
  border: none;
  background: #FFFFFF;
  font-size: 14px;
  font-family: "Nunito", sans-serif;
  /* font-weight: 900; */
  color: var(--col-help-center-feedback-form-text);
  resize: none;
  padding: 10px;
}

.submit-btn {
  height: 25px;
  width: 75px;
  border-radius: 5px;
  border: none;
  background: #BEDAFF;
  color: #ffffff;
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
}

.n-btn {
  height: 25px;
  width: 30px;
  border-radius: 5px;
  border: none;
  background: #D2DBE4;
  color: #ffffff;
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
}

.help-message-navigate-button {
  height: 30px;
  width: 30px;
  border-radius: 5px;
  border: none;
  margin-left: 5px;
  cursor: pointer;
}

.arrow-up {
  background: #4C80FF url("/icons/arrow_up.svg")
  no-repeat center;
  color: #FFFFFF;
}

.arrow-down {
  background: #4C80FF url("/icons/arrow_down.svg")
  no-repeat center;
  color: #ffffff;
}

.mod-sign-btn {
  background: #4C80FF;
  color: #FFFFFF;
}

.disabled-btn-up {
  background: #BEDAFF url("/icons/arrow_up.svg")
  no-repeat center;
  color: #FFFFFF;
}

.disabled-btn-down {
  background: #BEDAFF url("/icons/arrow_down.svg")
  no-repeat center;
  color: #FFFFFF;
}
.message-full-mode {

}
</style>
