<template>
  <div class="full-flex">
    <div v-if="resources.length === 0">
      You're all caught up on resources!
    </div>
    <div class="full-flex" v-else>
      <img :src="selectedResource.preview_url">

      <div class="stats-strip__divider" />

      <div>
        <div>
          {{ selectedResource.title }}
        </div>
        <div>
          <span>{{ selectedResource.subtitle }}</span>
          <span>| {{ selectedResource.subject_area }}</span>
          <span v-if="selectedResource.grade">| {{ selectedResource.grade }}</span>
        </div>
        <div>
          <span>{{ selectedUser.first_name }} {{ selectedUser.last_name }}</span>
          <img :src="selectedUser.avatar_locator">
        </div>
        <div>
          <b>Overview:</b>{{ selectedResource.description }}
        </div>
      </div>

      <div class="stats-strip__divider" />

      <div>
        <div>
          <textarea v-model="resourceCommentBody" placeholder="Add Comment..." />
        </div>
        <input type="number" v-model="selectedResource.curator_score">
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
