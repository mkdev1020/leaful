
<template>
  <div style="width: 100%; display: flex;">
    <div
      v-if="supportThreads.length"
      style="width: 100%; display: flex;"
    >
      <help-message-thread
        v-if="selectedSupportThread"
        :supportMessages="selectedSupportThread.teacherMessages"
        :threadIndex="supportThreadIndex"
        :threadIndexMax="supportThreads.length"
        @skip="skipSupportThread"
      />

      <div class="stats-strip__divider" />

      <help-message-thread
        v-if="selectedSupportThread"
        :supportMessages="selectedSupportThread.adminMessages"
        :isAdmin="true"
        @submitResponse="submitSupportResponse"
        @resolve="markSupportThreadResolved"
      />
    </div>
    <div v-else>
      You're all caught up on Support threads!
    </div>

  </div>

</template>

<script>
import HelpMessageThread from '../../../components/exceptions/HelpMessageThread';

export default {
  components: {
    HelpMessageThread,
  },

  computed: {
    supportThreads() {
      return this.$store.state.exceptions.supportThreads;
    },
    supportThreadIndex() {
      return this.$store.state.exceptions.supportThreadIndex;
    },
    users() {
      return this.$store.state.exceptions.users;
    },
    usersById() {
      return this.$store.getters['exceptions/usersById'];
    },

    selectedSupportThread() {
      const thread = this.supportThreads[this.supportThreadIndex];
      if (!thread) {
        return null;
      }

      const messages = thread.messages.map(message => {
        return Object.assign({}, message, {
          user: this.usersById[message.users_id_from],
        });
      });

      const threadModified = Object.assign({}, thread, {
        messages,

        adminMessages: messages.filter(message => {
          return message.user.role === 'admin';
        }),
        teacherMessages: messages.filter(message => {
          return message.user.role !== 'admin';
        }),
      });

      return threadModified;
    },
  },

  methods: {
    async submitSupportResponse(responseBody) {
      const id = this.selectedSupportThread.id;
      const response = await this.$sdk.post(`/help/inquiries/${id}/message`, {
        message: responseBody,
      });
      this.$store.commit('exceptions/clearSelectedThread')
    },

    async markSupportThreadResolved() {
      const id = this.selectedSupportThread.id;
      const response = await this.$sdk.patch(`/help/inquiries/${id}`, {
        is_resolved: true,
      });
      this.$store.commit('exceptions/clearSelectedThread')
    },

    skipSupportThread() {
      this.$store.commit('exceptions/skipSupportThread')
    },
  },

};
</script>
