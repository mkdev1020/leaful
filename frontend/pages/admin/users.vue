<template>
  <div>
    <!-- <img
    src="https://www.learningful.com/specs/images/user_database_search.jpg"
    style="
    position: fixed;
    top : -200px;
    left: 0;
    opacity: 0.5;
    z-index: 20;
    pointer-events: none;
    "
    > -->

    <div class="info-line">
      <div v-if="searchMode">
        User Database <b>Search</b>:
        <input type="text" placeholder="Search" v-model="searchQuery">
        <button type="button" @click="searchQuery = ''; searchMode = false;">x</button>
      </div>
      <div v-else-if="!infoLineText">
        Learningful has <b>{{ numActiveUsers }}</b> active users. |
        <a
          class="link"
          @click="searchMode = true"
        >
          Search
        </a>
      </div>
      <div v-else v-html="infoLineText" />
    </div>

    <div class="divider-h" />
    <div class="stats-strip">
      <div class="stats-strip__content">

        <div style="width: 28px">
          <div
            class="sorter-button"
            v-for="sorter in sorters"
            :key="sorter"
            @click="sortBy(sorter)"
          >
            <img :src="getSorterIcon(sorter)">
          </div>
        </div>

        <div class="stats-strip__divider" />

        <div class="user-list">
          <div
            v-for="user in usersResults"
            :key="user.id"
          >
            <div
              class="user-list__user"
              @click="selectUser(user)"
            >
              <img :src="user.avatar_locator">
            </div>
          </div>
        </div>

        <div class="stats-strip__divider" />

        <div class="user-avatar-big">
          <img
            v-if="selectedUser"
            :src="selectedUser.avatar_locator"
          >
        </div>

        <div class="stats-strip__divider" style="margin: 0 25px" />

        <div class="detail-line">
          <div class="detail-line__arrows">
            <div class="detail-line__arrow detail-line__arrow--up">
              <img src="/api/images/base/up_arrow.svg">
            </div>
            <div class="detail-line__arrow detail-line__arrow--down">
              <img src="/api/images/base/up_arrow.svg">
            </div>
          </div>

          <div class="detail-line__list" v-if="selectedUser">

            <detail-line name="Name" @save="saveName" :value="selectedUser.first_name + ' ' + selectedUser.last_name">
              {{ selectedUser.last_name }}, {{ selectedUser.first_name }}
            </detail-line>

            <detail-line name="Alias" @save="saveAlias" :value="selectedUser.alias_first_name ? (selectedUser.alias_first_name + ' ' + selectedUser.alias_last_name) : ''">
              <span v-if="selectedUser.alias_first_name">
                {{ selectedUser.alias_last_name }}, {{ selectedUser.alias_first_name }}
              </span>
              <span v-else>None</span>
            </detail-line>

            <detail-line name="Username" :value="selectedUser.username" @save="(val) => setUserProperty('username', val)">
              @{{ selectedUser.username }}
            </detail-line>

            <detail-line readonly name="Account Created">
              {{ selectedUser.created_at }}
            </detail-line>

            <detail-line readonly name="Last Active">
              {{ selectedUser.last_sign_in_date || 'Never' }}
            </detail-line>

            <detail-line name="Account Status" readonly>
              {{
                selectedUser.is_dormant
                  ? 'Dormant'
                  : (selectedUser.is_deactivated ? 'Deactivated' : 'Active')
              }}
            </detail-line>

            <detail-line readonly name="Membership">
              {{ selectedUser.is_recent_donator ? 'Paid' : 'Free' }}
            </detail-line>

            <detail-line name="Admin Level"       :value="selectedUser.role === 'admin'" @save="toggleAdminStatus" enabler />
            <detail-line name="Synthetic Persona" :value="selectedUser.is_zombie"        @save="(val) => setUserProperty('is_zombie', val)" enabler />
            <detail-line name="USA Resident"      :value="selectedUser.is_usa_resident"  @save="(val) => setUserProperty('is_usa_resident', val)" enabler />

            <detail-line name="Primary Email" :value="selectedUser.email" @save="(val) => setUserProperty('email', val)" >
              {{ selectedUser.email }}
            </detail-line>

            <!-- TODO TODO TODO -->
            <!-- <detail-line name="Recovery Email" @save="doSave" :value="selectedUser.">
              {{ selectedUser. }}
            </detail-line> -->

            <!-- TODO TODO TODO -->
            <!-- <detail-line name="Payout Email" @save="doSave" :value="selectedUser.">
              {{ selectedUser. }}
            </detail-line> -->

            <detail-line name="Password" readonly>
              <span v-if="selectedUser.resetLinkSent">Sent reset email!</span>
              <a class="link" v-else @click="sendResetLink">Reset</a>
            </detail-line>

            <!-- TODO TODO TODO -->
            <!-- <detail-line name="Security Pattern" enabler /> -->

            <detail-line name="Resources Published" readonly>
              {{ selectedUser.details.resources }}
            </detail-line>

            <!-- TODO TODO TODO -->
            <!-- <detail-line name="Featured Resources" @save="doSave" readonly></detail-line> -->

            <detail-line name="Downloads" readonly>
              {{ selectedUser.downloads }}
            </detail-line>

            <detail-line name="Follow Ratio" readonly>
              {{ selectedUser.details.followers }} | {{ selectedUser.details.following }}
            </detail-line>

            <detail-line name="Ads Running" readonly>
              <span
                v-for="(ad, index) in selectedUser.details.adsRunning"
                :key="ad.id"
              >
                <span v-if="index !== 0">,</span>
                <!-- TODO TODO TODO -->
                <a href='#'>{{ ad.id }}</a>
              </span>
            </detail-line>

            <detail-line name="Income" readonly>
              {{ (selectedUser.details.totalIncome / 100) | currency }}
            </detail-line>

            <detail-line name="Tips" readonly>
              {{ (selectedUser.details.totalTips / 100) | currency }}
            </detail-line>

            <detail-line name="Donations" readonly>
              {{ (selectedUser.details.totalDonations / 100) | currency }}
            </detail-line>

            <detail-line name="Total Earnings" readonly>
              {{ ((selectedUser.details.totalIncome + selectedUser.details.totalTips) / 100) | currency }}
            </detail-line>

            <detail-line name="Balance" @save="adjustBalance" :value="selectedUser.balance / 100">
              {{ (selectedUser.balance / 100) | currency }}
            </detail-line>

            <detail-line name="Login"       :value="selectedUser.permissions.login"     @save="togglePermission('login')"     enabler />
            <detail-line name="Download"    :value="selectedUser.permissions.download"  @save="togglePermission('download')"  enabler />
            <detail-line name="Editing"     :value="selectedUser.permissions.editing"   @save="togglePermission('editing')"   enabler />
            <detail-line name="Messaging"   :value="selectedUser.permissions.messages"  @save="togglePermission('messages')"  enabler />
            <detail-line name="Settings"    :value="selectedUser.permissions.controls"  @save="togglePermission('controls')"  enabler />
            <detail-line name="Income"      :value="selectedUser.permissions.income"    @save="togglePermission('income')"    enabler />
            <detail-line name="Payouts"     :value="selectedUser.permissions.payouts"   @save="togglePermission('payouts')"   enabler />
            <detail-line name="Payments"    :value="selectedUser.permissions.payments"  @save="togglePermission('payments')"  enabler />
            <detail-line name="Advertising" :value="selectedUser.permissions.advertise" @save="togglePermission('advertise')" enabler />
            <detail-line name="Following"   :value="selectedUser.permissions.follow"    @save="togglePermission('follow')"    enabler />

          </div>
        </div>

      </div>
    </div>
    <div class="divider-h" />

    <div class="bottom-row">
      <div style="float: left">
        Send a message to all Learningful users:
        <a @click="sendMessageMode = true">Email Userbase</a>
      </div>
      <div style="float: right">
        <a @click="$sdk.clearAuthentication()" class="link-sign-out">
          Sign Out
        </a>
      </div>
    </div>

  </div>
</template>

<style>
.sorter-button {
  cursor: pointer;
}

.user-list {
  width : 264px;
  height: 130px;
  overflow-y: scroll;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  grid-gap: 5px;
}

.user-list__user {
  display: flex;
  overflow: hidden;
  border-radius: 5px;
  cursor: pointer;
  border: 2px solid transparent;
}

.user-list__user--selected {
  border: 2px solid black;
}

.user-list__user img {
  width: 100%;
}

.user-avatar-big {
  display: flex;
  width : 130px;
  height: 130px;
}

.user-avatar-big img {
  border-radius: 5px;
}

</style>

<script>
import { DateTime } from 'luxon';

import DetailLine from '../../components/DetailLine';

export default {
  components: {
    DetailLine,
  },

  data() {
    return {
      infoLineText: '',
      infoLineTimeout: null,

      searchMode: false,
      searchQuery: '',
      sendMessageMode: false,

      sorters: [
        'last_active',
        'balance',
        'downloads',
        'created',
      ],
      sorterFields: {
        last_active: 'last_sign_in_date',
        balance    : 'balance',
        downloads  : 'downloads',
        created    : 'created_at',
      },
      sortingBy: 'last_active',
      sortDirection: -1,

      users: [],
      selectedUser: null,

      userFields: [
      ],
    };
  },

  computed: {
    numActiveUsers() {
      let active = 0;
      for (const user of this.users) {
        const lastSignIn = DateTime.fromISO(user.last_sign_in_date);
        const daysSinceSignIn = DateTime.now().toUTC().diff(lastSignIn).as('days');
        if (daysSinceSignIn <= 30) {
          active += 1;
        }
      }
      return active;
    },

    sorterField() {
      return this.sorterFields[this.sortingBy];
    },

    usersResults() {
      return this.users
        .filter((user) => {
          const regexp = new RegExp(`${this.searchQuery}`, 'gim');
          const userStringified = JSON.stringify(user);
          return regexp.exec(userStringified);
        })
        .sort((userA, userB) => {
          if (userA[this.sorterField] > userB[this.sorterField]) {
            return 1 * this.sortDirection;
          }
          if (userA[this.sorterField] < userB[this.sorterField]) {
            return -1 * this.sortDirection;
          }
          return 0;
        })
      ;
    },
  },

  methods: {
    async fetchUsers() {
      const response = await this.$sdk.get('/users/');
      const json = await response.json();
      console.log(json);
      this.users = json.users || [];
      if (this.users.length > 0) {
        this.selectUser(this.users[0]);
      }
    },

    getSorterIcon(sorter) {
      let suffix = '';
      if (this.sortingBy === sorter) {
        suffix = '_blue';
      }
      return `/api/images/base/${sorter}${suffix}.svg`;
    },

    sortBy(sorter) {
      if (this.sortingBy === sorter) {
        this.sortDirection = -this.sortDirection;
        return;
      }
      this.sortingBy = sorter;
      this.sortDirection = -1;
    },

    async selectUser(user) {
      const details = await this.fetchUserDetails(user.id);
      const permissions = await this.fetchUserPermissions(user.id);
      this.selectedUser = Object.assign({}, user, { details, permissions });
      console.log('selected user:', this.selectedUser);
    },

    async adjustBalance(newBalance) {
      newBalance = parseFloat(newBalance) * 100;
      const balanceDiff = newBalance - this.selectedUser.balance;

      console.log(this.selectedUser.balance, "NEW BALANCE:", newBalance, 'diff:', balanceDiff);

      const response = await this.$sdk.post(`/users/${this.selectedUser.id}/balance-adjustment`, {
        amount: balanceDiff,
      });

      this.selectedUser.balance = newBalance;
    },

    async fetchUserDetails(id) {
      const response = await this.$sdk.get(`/users/${id}/stats`);
      const json = await response.json();
      return json.stats || {};

      // const earnings = income + tips;
    },

    async fetchUserPermissions(id) {
      const response = await this.$sdk.get(`/users/${id}/permissions`);
      const json = await response.json();
      return json.permissions || {};
    },

    async togglePermission(permission) {
      await this.updateSelectedUserPermissions({
        [permission]: !this.selectedUser.permissions[permission],
      });
    },

    async toggleAdminStatus() {
      await this.updateSelectedUserProperties({ role: this.selectedUser.role === 'teacher' ? 'admin' : 'teacher' });
    },

    async setUserProperty(name, val) {
      await this.updateSelectedUserProperties({ [name]: val });
    },

    async saveName(name) {
      const parts = name.split(' ');
      const [firstName, lastName] = [parts[0], parts[1]];
      await this.updateSelectedUserProperties({
        first_name: firstName,
        last_name: lastName,
      });
    },

    async saveAlias(alias) {
      const parts = alias.split(' ');
      const [firstName, lastName] = [parts[0], parts[1]];
      await this.updateSelectedUserProperties({
        alias_first_name: firstName,
        alias_last_name: lastName,
      });
    },

    async updateSelectedUserProperties(properties) {
      await this.$sdk.patch(`/users/${this.selectedUser.id}`, properties);
      // no error-- update locally!
      for (const [key, val] of Object.entries(properties)) {
        this.selectedUser[key] = val;
      }
    },

    async updateSelectedUserPermissions(permissions) {
      await this.$sdk.patch(`/users/${this.selectedUser.id}/permissions`, permissions);
      // no error-- update locally!
      for (const [key, val] of Object.entries(permissions)) {
        this.selectedUser.permissions[key] = val;
      }
    },

    async sendResetLink() {
      await this.$sdk.sendLoginLink(this.selectedUser.email);
      this.$set(this.selectedUser, 'resetLinkSent', true);
    },

  },

  async mounted() {
    await this.fetchUsers();
  },
};
</script>
