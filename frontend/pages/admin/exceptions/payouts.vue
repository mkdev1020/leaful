<template>
  <div style="display: flex; width: 100%;">
    <div style="display: flex; width: 100%;" v-if="payouts.length === 0">
      No users to payout!
    </div>
    <div
      v-else
      style="display: flex; width: 100%;">
      <div class="users">
        <div
          class="users__user"
          :class="{
            'users__user--selected': isPayoutSelected(payout),
          }"
          v-for="payout in payouts"
          :key="payout.id"
          @click="selectPayout(payout)"
        >
          <img :src="usersById[payout.users_id].avatar_locator">
        </div>
      </div>

      <div class="stats-strip__divider" />

      <div class="payout-details" v-if="selectedPayout">
        <detail-line name="Payee" readonly>
          {{ selectedUser.first_name }} {{ selectedUser.last_name }}
        </detail-line>

        <detail-line name="Date" readonly>
          {{ selectedPayout.created_at | date('m/d/yyyy') }}
        </detail-line>

        <detail-line name="Amount" readonly>
          {{ selectedPayout.amount | currencyCents }}
        </detail-line>

        <button @click="approveSelected">
          Approve
        </button>

        <button @click="rejectSelected">
          X
        </button>
      </div>

      <div class="payout-details" v-else>
        <detail-line name="Payees" readonly>
          {{ payouts.length }}
        </detail-line>
        <detail-line name="Total Payout" readonly>
          {{ totalPayout | currencyCents }}
        </detail-line>
        <detail-line name="Unpaid" readonly>
          {{ totalEligiblePayouts | currencyCents }}
        </detail-line>

        <button @click="approveAll">
          Approve All
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.users {
  display: grid;
  grid-gap: 5px;
  grid-template-columns: repeat(10, 50px);
  grid-template-rows:    repeat(auto, 50px);
}

.users__user {
  display: flex;
  border-radius: 5px;
  border: 4px solid transparent;
  width : 50px;
  height: 50px;
  overflow: hidden;
}

.users__user--selected {
  border-color: black;
}

.users__user img {
  width: 100%;
}

.payout-details {
  width: 200px;
}
</style>

<script>
import DetailLine from '../../../components/DetailLine';

export default {
  components: {
    DetailLine,
  },

  data() {
    return {
      selectedPayout: null,
    };
  },

  computed: {
    payouts() {
      return this.$store.state.exceptions.payouts;
    },
    totalEligiblePayouts() {
      return this.$store.state.exceptions.totalEligiblePayouts;
    },
    usersById() {
      return this.$store.getters['exceptions/usersById'];
    },
    totalPayout() {
      return this.payouts.reduce((prev, curr) => {
        return prev + curr.amount;
      }, 0);
    },
    selectedUser() {
      if (!this.selectedPayout) {
        return null;
      }
      return this.usersById[this.selectedPayout.users_id];
    },
  },

  methods: {
    selectPayout(payout) {
      this.selectedPayout = payout;
    },
    async approveSelected() {
      await this.approveForUsers([ this.selectedPayout.users_id ]);
    },
    async approveAll() {
      await this.approveForUsers(Array.from(this.payouts.map(payout => payout.users_id)));
    },
    async rejectSelected() {
      await this.rejectForUsers([ this.selectedPayout.users_id ]);
    },
    async approveForUsers(userIds) {
      console.log('userIds:', userIds);
      await this.$sdk.post(`/payouts/approval`, {
        userIds,
      });
      this.removePayoutsForUsers(userIds);
      this.selectedPayout = null;
    },
    async rejectForUsers(userIds) {
      console.log('userIds:', userIds);
      await this.$sdk.post(`/payouts/rejection`, {
        userIds,
      });
      this.removePayoutsForUsers(userIds);
      this.selectedPayout = null;
    },
    removePayoutsForUsers(userIds) {
      for (const userId of userIds) {
        this.removePayoutsForUser(userId);
      }
    },
    removePayoutsForUser(userId) {
      const index = this.payouts.findIndex(payout => payout.users_id === userId);
      console.log('index:', index);
      if (index === undefined) {
        return;
      }
      let payouts = this.payouts.slice();
      payouts.splice(index, 1);
      console.log(payouts);
      this.$store.commit('exceptions/set', {
        payouts,
      });
    },
    isPayoutSelected(payout) {
      if (!this.selectedPayout) {
        return false;
      }
      return payout?.id === this.selectedPayout.id;
    },
  },

};
</script>
