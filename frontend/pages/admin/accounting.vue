<template>
  <div>

    <!-- <img
    src="https://www.learningful.com/specs/images/daily_accounting_2.jpg"
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
      <div v-if="selectedUser">
        {{ selectedUser.last_name }}, {{ selectedUser.first_name }}:
        <b>{{ selectedDate.downloadsByUser[selectedUser.id].downloads }}</b>
        |
        <b class="green-text">{{
          selectedDate.downloadsByUser[selectedUser.id].percentage
          * calculateRevenueShare(selectedDate) | currencyCents
        }}</b>
        |
        <b class="blue-text">{{ Math.round(selectedDate.downloadsByUser[selectedUser.id].percentage * 1000) / 10 }}%</b>
      </div>
      <div v-else-if="!infoLineText && selectedDate">
        Daily accounting for <b>{{ selectedDateDisplay }}</b>
        |
        <b v-if="selectedDate.is_finalized">Finalized</b>
        <span v-else>
          <a class="link" @click="finalize">Finalize</a>
        </span>
      </div>
      <div v-else-if="!selectedDate">
        Loading...
      </div>
      <div v-else v-html="infoLineText" />
    </div>

    <div class="divider-h" />
    <div class="stats-strip">
      <div class="stats-strip__content">

        <div class="calendar">
          <div
            class="calendar__day"
            v-for="balance of balances"
            :key="balance.record_date"
            :class="{
              'calendar__day--selected'   : isBalanceSelected(balance),
              'calendar__day--finalized'  : isBalanceFinalized(balance),
              'calendar__day--unfinalized': isBalanceUnfinalized(balance),
            }"
            @click="selectDate(balance)"
          >
            {{ getDayNumber(balance.record_date) }}
          </div>
        </div>

        <div class="stats-strip__divider" />

        <div style="min-width: 220px" v-if="selectedDate">
          <detail-line name="Advertising" readonly>
            {{ selectedDate.adRevenue | currency }}
          </detail-line>
          <detail-line name="Donations" readonly>
            {{ selectedDate.donations | currency }}
          </detail-line>
          <detail-line name="Misc. Income" :value="selectedDate.affiliate_revenue / 100" @save="(value) => { saveAffiliateRevenue(value * 100) }">
            {{ selectedDate.affiliate_revenue | currencyCents }}
          </detail-line>
          <detail-line name="Expenses" :value="selectedDate.expenses / 100" @save="(value) => { saveExpenses(value * 100) }">
            <b class="magenta-text">{{ selectedDate.expenses | currencyCents }}</b>
          </detail-line>
          <detail-line name="Net Revenue" readonly>
            {{ calculateNetRevenue(selectedDate) | currencyCents }}
          </detail-line>
        </div>

        <div class="stats-strip__divider" />

        <div style="min-width: 220px" v-if="selectedDate">
          <detail-line :name="(selectedDate.globalRevenueShare * 100) + '% Share'" readonly>
            {{ calculateRevenueShare(selectedDate) | currencyCents }}
          </detail-line>
          <detail-line name="Downloads" readonly>
            {{ calculateTotalDownloads(selectedDate) }}
          </detail-line>
          <detail-line name="Contributors" readonly>
            {{ calculateNumContributors(selectedDate) }}
          </detail-line>
          <detail-line name="EPD" readonly>
            {{ calculateEarningsPerDownload(selectedDate) | currencyCents }}
          </detail-line>
          <detail-line name="Status" readonly>
            {{ selectedDate.is_finalized ? 'Finalized' : 'Estimated' }}
          </detail-line>
        </div>

        <div class="stats-strip__divider" />

        <div class="user-list">
          <div
            class="user-list__user"
            v-for="user in getUsersForBalance(selectedDate)"
            :key="user.id"
            @click="selectedUser = user"
          >
            <img :src="user.avatar_locator">
          </div>
        </div>

      </div>
    </div>
    <div class="divider-h" />

    <div class="bottom-row">
      <div style="float: left">
        You are logged in as a Learningful administrator.
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
.calendar {
  height: 130px;
  min-width: 232px;
  overflow-y: scroll;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  grid-gap: 8px;
}

.calendar__day {
  --size: 26px;
  width : var(--size);
  height: var(--size);

  display: flex;
  align-items: center;
  justify-content: center;
  background: #bddbfe;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  color: white;
  cursor: pointer;
}

.calendar__day--unfinalized {
  background: #ff3fdd;
}

.calendar__day--finalized {
  background: #12f4bc;
}

.calendar__day--selected {
  background: #4b7ffe;
}

.magenta-text {
  color: #ff3fdd;
}

.green-text {
  color: #06d38c;
}

.blue-text {
  color: #4a80ff;
}

</style>

<style scoped>

.user-list {
  width : 264px;
  height: 130px;
  overflow-y: scroll;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  grid-gap: 3px;
  grid-auto-rows: min-content;
}

.user-list__user {
  --size: 30px;
  min-width : var(--size);
  min-height: var(--size);
  max-width : var(--size);
  max-height: var(--size);
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

      startDate: null,
      endDate: null,

      selectedDate: null,
      balances: [],
      contributorUsers: [],
      selectedUser: null,
    };
  },
  computed: {
    selectedDateDisplay() {
      if (!this.selectedDate) {
        return '';
      }
      return DateTime.fromISO(this.selectedDate?.record_date).toUTC().toFormat('LLL dd, yyyy');
    },
  },
  methods: {
    getDayNumber(dateString) {
      return DateTime.fromISO(dateString).toUTC().startOf('day').day;
    },
    isBalanceSelected(balance) {
      return this.selectedDate?.record_date === balance.record_date;
    },
    isBalanceFinalized(balance) {
      return balance.is_finalized;
    },
    isBalanceUnfinalized(balance) {
      if (balance.is_finalized) {
        return false;
      }
      const daysUntil = DateTime.fromISO(balance.record_date).diff(DateTime.now().toUTC().toUTC()).as('days');
      return daysUntil < 0;
    },
    calculateNetRevenue(balance) {
      return balance.adRevenue + balance.affiliate_revenue - balance.expenses;
    },
    calculateTotalDownloads(balance) {
      return Object.values(balance.downloadsByUser).reduce((prev, curr) => {
        return prev + curr.downloads;
      }, 0);
    },
    calculateNumContributors(balance) {
      return Object.keys(balance.downloadsByUser).length;
    },
    calculateRevenueShare(balance) {
      return this.calculateNetRevenue(balance) * balance.globalRevenueShare;
    },
    calculateEarningsPerDownload(balance) {
      const numDownloads = this.calculateTotalDownloads(balance);
      const revenueShare = this.calculateRevenueShare(balance);
      if (!numDownloads || !revenueShare) {
        return 0;
      }
      return revenueShare / numDownloads;
    },
    getUsersForBalance(balance) {
      if (balance === null) {
        return;
      }
      const userIds = Object.keys(balance.downloadsByUser);

      const users = userIds.map((userId) => {
        return this.contributorUsers[userId];
      });

      return users;
    },

    async saveAffiliateRevenue(affiliate_revenue) {
      await this.updateSelectedBalanceProperties({
        affiliate_revenue,
      });
    },

    async saveExpenses(expenses) {
      await this.updateSelectedBalanceProperties({
        expenses,
      });
    },

    async updateSelectedBalanceProperties(properties) {
      const date = this.selectedDate.record_date;
      await this.$sdk.patch(`/balances/${date}`, properties);
      // no error-- update locally!
      for (const [key, val] of Object.entries(properties)) {
        this.selectedDate[key] = val;
      }
    },

    async finalize() {
      // TODO TODO TODO
    },

    async selectDate(balance) {
      this.selectedDate = balance;
      this.selectedUser = null;

      const dateFormatted      = DateTime.fromISO(this.selectedDate.record_date).toUTC().toFormat('yyyy-MM-dd');
      const startDateFormatted = DateTime.fromISO(this.startDate).toUTC().toFormat('yyyy-MM-dd');
      if (dateFormatted === startDateFormatted) {
        console.log('WE HAVE A WINNNER!!!!!!');
        await this.loadPreviousThreeWeeks();
      }
    },

    selectDateToday() {
      const dateToday = DateTime.now().toUTC().toFormat('yyyy-MM-dd');;
      for (const balance of this.balances) {
        const date = DateTime.fromISO(balance.record_date).toUTC().toFormat('yyyy-MM-dd');
        if (date === dateToday) {
          this.selectedDate = balance;
          break;
        }
      }
    },

    async getBalances({ startDate, endDate }) {
      return await this.$sdk.get('/balances', {
        start: startDate.toFormat('yyyy-MM-dd'),
        end  : endDate.toFormat('yyyy-MM-dd'),
      });
    },

    async loadPreviousThreeWeeks() {
      const endDate   = this.startDate.minus({ days: 1 });
      const startDate = endDate.minus({ days: 20 });
      this.startDate = startDate;

      const balances = await this.getBalances({
        startDate,
        endDate,
      });
      const balancesJson = await balances.json();
      const previousWeeks = balancesJson.balances;

      for (const [userId, user] of Object.entries(balancesJson.contributorUsers)) {
        this.contributorUsers[userId] = user;
      }

      this.balances = [].concat(previousWeeks, this.balances);
    },

  },
  async mounted() {
    const firstDate = DateTime.now().toUTC().startOf('week').minus({ days: 8 });

    this.startDate = firstDate;
    this.endDate   = firstDate.plus({ days: 27 });

    const balances = await this.getBalances({
      startDate: this.startDate,
      endDate  : this.endDate,
    });
    const balancesJson = await balances.json();

    this.balances = balancesJson.balances;
    this.contributorUsers = balancesJson.contributorUsers;

    this.selectDateToday();
  },
};

</script>
