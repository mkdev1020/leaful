<template>
  <div>
    <div class="info-line">
      <div v-if="!infoLineText">
        Site Statistics for <b>{{ dateAnchorDisplay }}</b> |
        <div v-if="editingDateAnchor" style="display: inline">
          <input type="date" v-model="dateAnchorSelection">
          <button
            type="button"
            @click="applyDateAnchorSelection()"
          >
            <i id="icon-check" class="icon-check" />
          </button>
        </div>
        <a
          class="link"
          v-else
          @click="editingDateAnchor = true"
        >
          Edit
        </a>
      </div>
      <div v-else v-html="infoLineText" />
    </div>

    <div class="divider-h" />
    <div class="stats-strip">
      <div class="stats-strip__content">

        <div class="week-graph-container"
          @mouseleave="clearWeeklyInfo()"
        >
          <div class="week-graph">
            <div
              class="week-graph__row"
              v-for="metric of weeklyMetrics"
              :key="metric.name"
              @mouseenter="showWeeklyInfo(metric)"
            >
              <div
                class="week-graph__bar"
                :style="{
                  width: `${metric.barLength}%`,
                }"
              >
                <div class="week-graph__percentage">
                  <b>{{ Math.round(metric.value * 100) }}%</b>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-strip__divider" />

        <div class="monthly-stat-buttons-container">
          <button
            class="monthly-stat-button"
            :class="{
              'monthly-stat-button--selected': metric === selectedMetric,
            }"
            v-for="metric in monthlyMetrics"
            :title="getFriendlyMetricName(metric)"
            :key="metric"
            @click="selectedMetric = metric"
          >
            <img :src="getImageSourceForMetric(metric)">
          </button>
        </div>

        <div class="stats-strip__divider" />

        <div
          class="month-graph"
          @mouseleave="timeoutClearInfo()"
        >
          <div
            class="month-graph__bar"
            v-for="day of days"
            :key="day.record_date"
            :style="{
              height: day[selectedMetric] + '%',
            }"
            @mouseenter="showMonthlyInfo(day)"
          />
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

<script>

import { DateTime } from 'luxon';

export default {
  data() {
    return {
      infoLineText: '',
      infoLineTimeout: null,

      days: [],
      selectedMetric: 'new_users',

      dateAnchor: DateTime.now(),
      dateAnchorSelection: DateTime.now().toFormat('yyyy-MM-dd'),
      editingDateAnchor: false,

      monthlyMetrics: [
        'new_users',
        'unique_logins',
        'total_users',
        'new_resources',
        'active_resources',
        'resource_downloads',
        'income_per_download',
        'ad_impressions',
        'ad_spend',
        'total_donations',
        'misc_income',
        'dormancy_income',
        'total_tips',
        'total_revenue',
        'total_unpaid_earnings',
      ],

      iconNames: {
        unique_logins         : 'ss_active_users',
        ad_impressions        : 'ss_ad_impressions',
        ad_spend              : 'ss_apd',
        total_donations       : 'ss_donations_made',
        dormancy_income       : 'ss_dormancy_income',
        resource_downloads    : 'ss_downloads',
        income_per_download   : 'ss_ipd',
        misc_income           : 'ss_misc_income',
        new_resources         : 'ss_new_resources',
        new_users             : 'ss_new_users',
        total_tips            : 'ss_tips_left',
        active_resources      : 'ss_total_resources',
        total_revenue         : 'ss_total_revenue',
        total_users           : 'ss_total_users',
        total_unpaid_earnings : 'ss_unpaid_earnings',
      },
    };
  },
  computed: {
    metrics() {
      if (this.days.length === 0) {
        return [];
      }
      return Object.keys(this.days[0]);
    },
    weeklyMetrics() {
      if (this.days.length < 7) {
        return [];
      }
      const latestData    = this.days[this.days.length - 1];
      const weekPriorData = this.days[this.days.length - 8];

      const metrics = [
        'new_users',
        'unique_logins',
        'new_resources',
        'resource_downloads',
        'ad_spend',
        'total_donations',
        'total_income'
      ];

      return metrics.map(metric => {
        const weekChange = (latestData[metric] || 1) / (weekPriorData[metric] || 1);

        const barLength = Math.max(0, Math.min(weekChange * 100, 100));
        return {
          currentWeekDate  : latestData.record_date,
          previousWeekDate : weekPriorData.record_date,
          currentWeekValue  : latestData[metric],
          previousWeekValue : weekPriorData[metric],
          name: metric,
          value: weekChange,
          barLength,
        };
      });
    },
    dateAnchorDisplay() {
      return this.dateAnchor.toFormat('DD');
    },
  },
  methods: {
    showWeeklyInfo(metric) {
      const currentWeekDate  = DateTime.fromISO(metric.currentWeekDate) .toFormat('DD');
      const previousWeekDate = DateTime.fromISO(metric.previousWeekDate).toFormat('D');
      const friendlyName = this.getFriendlyMetricName(metric.name);
      this.infoLineText = `${friendlyName} for <b>${currentWeekDate}</b>:
        ${metric.currentWeekValue} (${Math.round(metric.value * 100)}% of ${previousWeekDate})`;
    },
    clearWeeklyInfo() {
      this.infoLineText = '';
    },

    showMonthlyInfo(day) {
      const dateDisplay = DateTime.fromISO(day.record_date).toFormat('DD');
      const value = day[this.selectedMetric];
      const name = this.getFriendlyMetricName(this.selectedMetric);
      this.infoLineText = `${name} for <b>${dateDisplay}</b>: ${value}`;
    },

    timeoutClearInfo() {
      window.clearTimeout(this.infoLineTimeout);
      this.infoLineTimeout = window.setTimeout(() => this.infoLineText = '',1000);
    },

    async applyDateAnchorSelection() {
      this.dateAnchor = DateTime.fromISO(this.dateAnchorSelection);
      this.editingDateAnchor = false;

      const response = await this.$sdk.get('/stats', {
        end: this.dateAnchor.toFormat('yyyy-MM-dd'),
      });
      const responseJson = await response.json();
      this.days = responseJson.stats;
    },

    getFriendlyMetricName(name) {
      return name.split('_').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
    },

    getImageSourceForMetric(metric) {
      const iconName = this.iconNames[metric];
      const modifier = (metric === this.selectedMetric) ? '_white' : '';
      return `/api/images/base/${iconName}${modifier}.svg`;
    },
  },
  async mounted() {
    await Promise.all([
      this.applyDateAnchorSelection(),
    ]);
  },
}
</script>
