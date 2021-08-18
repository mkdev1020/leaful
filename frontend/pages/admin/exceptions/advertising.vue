<template>
  <div class="full-flex">
    <div v-if="advertisements.length === 0">
      You're all caught up on ads!
    </div>
    <div class="full-flex" v-else>
      <div class="first-cell">
        <img class="cover-image" :src="selectedAd.image_url">
      </div>


      <div class="exception_divider" />

      <div class="second-cell">
        <div class="sc-top">
          <span>{{ selectedUser.first_name }} {{ selectedUser.last_name }}</span>
          <img class="sc-profile-image" :src="selectedUser.avatar_locator">
        </div>

        <div class="sc-title">
          {{ selectedAd.title }}
        </div>
        <div class="sc-sub-title">
          <span>{{ selectedAd.subtitle }}</span>
          <span>| {{ selectedAd.subject }}</span>
          <span v-if="selectedAd.gradeDisplay">| {{ selectedAd.gradeDisplay }}</span>
        </div>

        <div class="sc-bottom">
          <span class="sc-days">{{ selectedAd.duration }}</span>&nbsp; Days &nbsp;| &nbsp;
          <span class="sc-currency">{{ selectedAd.spend_per_day | currencyCents }}</span>
        </div>
      </div>

      <div class="exception_divider" />

      <div>
        <div>
          <textarea class="sb-textarea" v-model="adCommentBody" placeholder="Add Comment..." />
        </div>
        <div class="sb-buttons">
          <div>
            <a class="skip-btn" @click="skip">
              Skip
            </a>
          </div>

          <div class="right-btn-grp">
            <button @click="approve" class="approve-btn">
              Approve
            </button>
            <button @click="reject" class="reject-btn">
              X
            </button>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

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

<style scoped>

.full-flex {
  width: 100%;
  display: flex;
}
.cover-image {
  height: 115px;
  width: 80px;
}

.sc-profile-image {
  width: 30px;
  height: 30px;
  margin-left: 5px;
}

.second-cell {
  width: 550px;
}

.sc-top {
  text-decoration: underline;
  font-family: 'Nunito', sans-serif;
  font-size: 16px;
  display: flex;
  justify-content: flex-end;
}

.sc-title {
  font-size: 14px;
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  color: #4a80ff;
  text-decoration: underline;
}

.sc-sub-title {
  font-size: 14px;
  font-family: 'Nunito', sans-serif;
}

.sc-bottom {
  font-size: 14px;
  font-family: 'Nunito', sans-serif;
  position: absolute;
  right: 310px;
  bottom: 100px;
  /*display: flex;*/
  /*justify-content: flex-end;*/
}

.sc-days {
  color: #000000;
  font-weight: 900;
}
.sc-currency {
  color: #4a80ff;
  font-weight: 900;
}

.full-flex {
  display: flex;
  width: 100%;
}

.sb-textarea {
  height: 60px;
  border-radius: 5px;
  border: none;
  background: var(--col-help-center-feedback-form-color);
  font-size: 14px;
  font-family: "Nunito", sans-serif;
  /* font-weight: 900; */
  color: var(--col-help-center-feedback-form-text);
  resize: none;
  padding: 10px;
}

.sb-buttons {
  position: absolute;
  bottom: 100px;
  display: flex;
}

.skip-btn {
  cursor: pointer;
  text-decoration: underline;
  font-size: 14px;
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  color: #8ea4bc;
}

.approve-btn {
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

.reject-btn {
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

.right-btn-grp {
  position: absolute;
  right: -170px;
}

</style>
