<template>
  <div class="full-flex">
    <div v-if="resources.length === 0">
      You're all caught up on resources!
    </div>
    <div class="full-flex" v-else>
      <img class="cover-image" :src="selectedResource.preview_url">

      <div class="exception_divider" />

      <div class="second-cell">
        <div class="sc-top">
          <span>{{ selectedUser.first_name }} {{ selectedUser.last_name }}</span>
          <img class="sc-profile-image" :src="selectedUser.avatar_locator">
        </div>
        <div class="sc-title">
          {{ selectedResource.title }}
        </div>
        <div class="sc-sub-title">
          <span>{{ selectedResource.subtitle }}</span>
          <span>| {{ selectedResource.subject_area }}</span>
          <span v-if="selectedResource.grade">| {{ selectedResource.grade }}</span>
        </div>

        <div class="publish-overview">
          <span class="overview-outline">Overview: </span>{{ selectedResource.description }}
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
export default {
  computed: {
    usersById() {
      return this.$store.getters['exceptions/usersById'];
    },
    resources() {
      return this.$store.state.exceptions.resources;
    },
    resourcesIndex() {
      return this.$store.state.exceptions.resourcesIndex;
    },
    selectedResource() {
      const resource = this.resources[this.resourcesIndex];
      if (!resource) {
        return null;
      }
      console.log(resource);

      return Object.assign({}, resource, {
        preview_url: resource.resources_previews_models[0].locator,
      });
    },
    selectedUser() {
      if (!this.selectedResource) {
        return null;
      }
      return this.usersById[this.selectedResource.users_id];
    },
    resourceCommentBody: {
      get() {
        return this.$store.state.exceptions.resourceCommentBody;
      },
      set(value) {
        this.$store.commit('exceptions/set', {
          resourceCommentBody: value,
        })
      },
    },
  },
  methods: {
    skip() {
      this.$store.commit('exceptions/clearSelectedResource');
    },
    async approve() {
      await this.$sdk.post(`/resources/${this.selectedResource.id}/approval`, {
        moderator_comment: this.resourceCommentBody,
        curator_score: this.selectedResource.curator_score,
      });
      this.$store.commit('exceptions/clearSelectedResource');
    },
    async reject() {
      await this.$sdk.post(`/resources/${this.selectedResource.id}/rejection`, {
        moderator_comment: this.resourceCommentBody,
        curator_score: this.selectedResource.curator_score,
      });
      this.$store.commit('exceptions/clearSelectedResource');
    },
  },
};
</script>

<style scoped>

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
  right: 270px;
  position: absolute;
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

.publish-overview {
  margin-top: 10px;
}

.overview-outline {
  font-weight: 700;
}
</style>
