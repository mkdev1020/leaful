
<template>
  <div class="message">
    <div class="message__top-bar">
      <img
        :src="user.avatar_locator"
        class="message__user-from"
      >
      <span>
        <b>
          {{ user.first_name }}
          {{ user.last_name }}
        </b>
      </span>

      <span style="width: 100%; text-align: right" v-if="responseBoxShowing">
        {{ todayISO | date('LLLL d, y') }}
      </span>
      <span style="width: 100%; text-align: right" v-else-if="supportMessage">
        {{ supportMessage.created_at | date('LLLL d, y') }}
      </span>

      <div class="message__nav">
        <button :disabled="!canDecrement()" @click="previousMessage">^</button>
        <button
          v-if="isAdmin && isLastMessage"
          :disabled="responseBoxShowing"
          @click="() => { responseBoxShowing = true }">
          %
        </button>
        <button
          v-else
          :disabled="!canIncrement()"
          @click="nextMessage">
          v
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
        class="message__response-box-textarea"
        placeholder="Type Response"
        v-model="responseBody"
      />
      <div class="message__response-box-buttons">
        <button :disabled="!canSkip" @click="skip">&lt;</button>
        <button @click="resolve">N</button>
        <button @click="submitResponse">Submit</button>
      </div>
    </div>

  </div>
</template>

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
}

.message__nav {
  display: flex;
  flex-direction: row;
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

</style>

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
  },

  data() {
    return {
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
  },

};
</script>
