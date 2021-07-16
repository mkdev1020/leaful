<template>
  <div class="full-flex">
    <div v-if="advertisements.length === 0">
      You're all caught up on ads!
    </div>
    <div class="full-flex" v-else>
      <img :src="selectedAd.image_url">

      <div class="stats-strip__divider" />

      <div>
        <div>
          {{ selectedAd.title }}
        </div>
        <div>
          <span>{{ selectedAd.subtitle }}</span>
          <span>| {{ selectedAd.subject }}</span>
          <span v-if="selectedAd.gradeDisplay">| {{ selectedAd.gradeDisplay }}</span>
        </div>
        <div>
          <span>{{ selectedUser.first_name }} {{ selectedUser.last_name }}</span>
          <img :src="selectedUser.avatar_locator">
        </div>
        <div>
          <span><b>{{ selectedAd.duration }}</b> Days</span>
          <span><b>{{ selectedAd.spend_per_day | currencyCents }}</b></span>
        </div>
      </div>

      <div class="stats-strip__divider" />

      <div>
        <div>
          <textarea v-model="adCommentBody" placeholder="Add Comment..." />
        </div>
        <button @click="skip">
          Skip
        </button>
        <button @click="approve">
          Approve
        </button>
        <button @click="reject">
          X
        </button>

      </div>

    </div>
  </div>
</template>

<style>
.full-flex {
  display: flex;
  width: 100%;
}
</style>

<script>
import { DateTime } from 'luxon';

export default {
  computed: {
    usersById() {
      return this.$store.getters['exceptions/usersById'];
    },
    advertisements() {
      return this.$store.state.exceptions.advertisements;
    },
    advertisementIndex() {
      return this.$store.state.exceptions.advertisementIndex;
    },
    selectedAd() {
      const ad = this.advertisements[this.advertisementIndex];
      if (!ad) {
        return null;
      }
      console.log(ad);

      return Object.assign({}, ad, {
        gradeDisplay: ad.advertisements_target_grades_models.map(grade => grade.grade).join(', '),
        duration: DateTime.fromISO(ad.end_date).diff(DateTime.fromISO(ad.start_date)).as('days'),
      });
    },
    selectedUser() {
      if (!this.selectedAd) {
        return null;
      }
      return this.usersById[this.selectedAd.users_id];
    },
    adCommentBody: {
      get() {
        return this.$store.state.exceptions.adCommentBody;
      },
      set(value) {
        this.$store.commit('exceptions/set', {
          adCommentBody: value,
        })
      },
    },
  },
  methods: {
    skip() {
      this.$store.commit('exceptions/clearSelectedAdvertisement');
    },
    async approve() {
      await this.$sdk.post(`/advertisements/${this.selectedAd.id}/approval`, {
        moderator_comment: this.adCommentBody,
      });
      this.$store.commit('exceptions/clearSelectedAdvertisement');
    },
    async reject() {
      await this.$sdk.post(`/advertisements/${this.selectedAd.id}/rejection`, {
        moderator_comment: this.adCommentBody,
      });
      this.$store.commit('exceptions/clearSelectedAdvertisement');
    },
  },
};
</script>
