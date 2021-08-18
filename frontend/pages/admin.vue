<template>
  <div class="container">

    <modal class="showing">

      <div class="user-modal-top">
        <div class="user-summary">
          <div class="user-summary__avatar">
            <img v-if="user.avatar_locator" :src="user.avatar_locator">
          </div>
          <div class="user-summary__stats">
            <div class="user-summary__name">
              {{ fullName }}
            </div>
            <div class="user-summary__summary">
              <div><b>{{ userStats.followers | largeNumberDisplay }}</b> Followers</div>
              <div class="mini-divider-h" />
              <div><b>{{ userStats.resources | largeNumberDisplay }}</b> Resources</div>
              <div class="mini-divider-h" />
              <div><b>{{ userStats.downloads | largeNumberDisplay }}</b> Downloads</div>
            </div>
            <div class="user-summary__username">
              <a href='#'>@{{ user.username }}</a>
            </div>
          </div>

          <div class="user-summary__controls">
            <button
              class="user-summary__control-button"
              :class="{
                'user-summary__control-button--selected': isControlSelected(control),
              }"
              v-for="control in adminControls"
              :key="control.route"
            >
              <NuxtLink :to="control.route">
                <img :src="getImageSourceForControl(control)">
              </NuxtLink>
            </button>
          </div>
        </div>
      </div>

      <NuxtChild />
    </modal>
  </div>
</template>

<style scoped>
.container {
  font-family: "Nunito";
}
</style>

<style>
.divider-h {
  width: 100%;
  height: 10px;
  background: white;
}

.link {
  color: var(--col-captcha-verify-text);
  text-decoration: underline;
  cursor: pointer;
}

.link-sign-out {
  color: #d0d0da;
  font-weight: bold;
  text-decoration: underline;
  cursor: pointer;
}

.user-modal-top {
  padding: 40px;
  padding-bottom: 0;
}

.user-summary {
  display: flex;
  align-items: center;
}

.user-summary__avatar {
  --size: 135px;
  width : var(--size);
  height: var(--size);
  min-width : var(--size);
  min-height: var(--size);
  display: flex;
  border: 4px solid black;
  border-radius: 10px;
  box-shadow: -5px 5px 0px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.user-summary__stats {
  margin-left: 23px;
  width: 100%;
}

.user-summary__name {
  font-size: 28px;
  font-weight: bold;
}

.user-summary__summary {
  font-size: 16px;
  display: flex;
  align-items: center;
}

.user-summary__username {
  font-weight: bold;
  font-size: 16px;
}

.user-summary__username a {
  color: #4a80ff;
  text-decoration: none;
}

.user-summary__controls {
  height: 135px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  grid-template-rows: 1fr;
  grid-gap: 8px;
}

.user-summary__control-button {
  margin: 0;
  padding: 0;
  background: white;
  border: 4px solid #d1dae8;
  border-radius: 5px;
  width : 45px;
  height: 45px;
  cursor: pointer;
  /* margin-left: 8px; */
}

.user-summary__control-button--selected {
  border: 4px solid #4a80ff;
}

.info-line {
  width: 100%;
  padding: 10px 40px 0;
  text-align: right;
}

.mini-divider-h {
  height: 10px;
  width : 2px;
  background: black;
  margin-left : 18px;
  margin-right: 18px;
}

.stats-strip {
  background: #e1f0ff;

  /* XXX */
  /* margin-left: 190px; */
  /*width: 1024px;*/
  height: 190px;
}

.stats-strip__content {
  padding: 30px 40px;
  display: flex;
}

.stats-strip__divider {
  min-width: 2px;
  max-width: 2px;
  width: 2px;
  margin: 0 18px;
  background: var(--col-captcha-verify-border-disabled);
}

.monthly-stat-buttons-container {
  display: grid;
  --size: 30px;
  grid-template-columns: var(--size) var(--size) var(--size) var(--size) var(--size);
  grid-template-rows   : var(--size) var(--size) var(--size);
  grid-gap: 20px;
}

.monthly-stat-button {
  background: white;
  border-radius: 10px;
  display: flex;
  width : 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  margin: 0;
  border: 0;
  padding: 0;
  cursor: pointer;
}

.monthly-stat-button--selected {
  background: #4a80ff;
}

.month-graph {
  display: flex;
  width : 100%;
  height: 128px;
  align-items: flex-end;
  margin: 0 auto;
}

.month-graph__bar {
  background: #b7ccfe;
  width: 100%;
  border-radius: 10px;
  margin-left : 1.5px;
  margin-right: 1.5px;
  transition: 0.3s ease height;
}

.month-graph__bar:first-of-type {
  margin-left: 0;
}
.month-graph__bar:last-of-type {
  margin-right: 0;
}

.week-graph-container {
  padding-right: 52px;
}

.week-graph {
  display: flex;
  flex-direction: column;
  width : 140px;
  height: 130px;
  align-items: flex-start;
  margin: 0 auto;
}

.week-graph__row {
  margin-top: 2px;
  margin-bottom: 2px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

.week-graph__bar {
  height: 100%;
  border-radius: 10px;
  margin-top : 2px;
  margin-bottom: 2px;
  transition: 0.3s ease height;
  position: relative;
  font-size: 14px;
}

.week-graph .week-graph__row:nth-of-type(1) .week-graph__bar { background: #ffc210; color: #ffc210; }
.week-graph .week-graph__row:nth-of-type(2) .week-graph__bar { background: #fe8467; color: #fe8467; }
.week-graph .week-graph__row:nth-of-type(3) .week-graph__bar { background: #fe4584; color: #fe4584; }
.week-graph .week-graph__row:nth-of-type(4) .week-graph__bar { background: #f217ff; color: #f217ff; }
.week-graph .week-graph__row:nth-of-type(5) .week-graph__bar { background: #ac4aff; color: #ac4aff; }
.week-graph .week-graph__row:nth-of-type(6) .week-graph__bar { background: #219bfe; color: #219bfe; }
.week-graph .week-graph__row:nth-of-type(7) .week-graph__bar { background: #06d38c; color: #06d38c; }

.week-graph__percentage {
  position: absolute;
  left: calc(100% + 5px);
  top: -1px;
}

.bottom-row {
  width: 100%;
  padding-left : 40px;
  padding-right: 40px;
  padding-top: 0;
  padding-bottom: 50px;
  color: gray;
}

</style>

<script>
import Modal from '../components/Modal';

export default {
  components: {
    Modal,
  },

  data() {
    return {
      adminControls: [
        { route: '/admin/users',      icon: 'user_database' },
        { route: '/admin/accounting', icon: 'daily_accounting' },
        { route: '/admin/statistics', icon: 'site_statistics' },
        { route: '/admin/settings',   icon: 'admin_settings' },
        { route: '/admin/exceptions', icon: 'exceptions' },
      ],

      // user: {
      //   avatar_locator: '',
      //   alias_first_name: '',
      //   alias_last_name : '',
      //   first_name: '',
      //   last_name : '',
      //   username: '',
      // },

      userStats: {
        followers: 0,
        resources: 0,
        downloads: 0,
      },
    };
  },

  computed: {
    selectedControl() {
      return this.controlsForRoute[this.$route.path];
    },
    fullName() {
      if (this.user.alias_first_name) {
        return `${this.user.alias_first_name} ${this.user.alias_last_name}`;
      }
      return `${this.user.first_name} ${this.user.last_name}`;
    },
    user() {
      return this.$store.state.main.user;
    },
  },

  methods: {
    getImageSourceForControl(control) {
      const modifier = (this.isControlSelected(control)) ? '_blue' : '';
      return `/api/images/base/${control.icon}${modifier}.svg`;
    },

    isControlSelected(control) {
      return this.$route.path.startsWith(control.route);
    },

    async fetchUser() {
      const response = await this.$sdk.get('/users/self');
      const json = await response.json();
      // this.user = json.user || {};
      this.$store.commit('main/set', {
        user: json.user,
      });
    },

    async fetchUserStats() {
      const response = await this.$sdk.get('/users/self/stats');
      const json = await response.json();
      this.userStats = json.stats || {};
    },
  },

  async mounted() {
    await Promise.all([
      this.fetchUser(),
      this.fetchUserStats(),
    ]);
  },

};
</script>
