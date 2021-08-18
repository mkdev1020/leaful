<template>
  <div class="container">
    <div>
      <div>Donation Pricing</div>
      <div>
        Set up to 3 different arrays, consisting of 3 prices, to split test them
        against each other.
      </div>
      <div class="row-split">
        <div>
          <button class="link" @click="selectMetric('prompt')">Prompt</button>
          <button class="link" @click="selectMetric('sidebar')">Sidebar</button>
        </div>
        <div>
          <button @click="update">
            Update
          </button>
        </div>
      </div>
    </div>

    <div class="stats-strip__divider" />

    <div>
      <input type="text" placeholder="Default Pricing" v-model="variationInputs[0]">
      <input type="text" placeholder="Variation 1"     v-model="variationInputs[1]">
      <input type="text" placeholder="Variation 2"     v-model="variationInputs[2]">
    </div>

    <div class="stats-strip__divider" />

    <div>
      <div class="row-split">
        <div>Data</div>
        <div>Last Updated: {{ lastUpdated | date('M/d/yyyy') }}</div>
      </div>
      <div>
        <div
          class="metric-row row-split"
          v-for="metricDisplay in metricDisplay"
          :key="metricDisplay.key"
        >
          <div>{{ metricDisplay.label }}</div>
          <div class="metric-row__data">
            <div v-for="(metric, index) in metrics" :key="metric.id">
              <span v-if="index > 0">&nbsp;|</span>
              {{ metricDisplay.displayFunc(metric.stats[metricDisplay.key]) }}
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.container {
  display: grid;
  grid-template-columns: 205px auto 137px auto 330px;
}

.metric-row {
  display: flex;
  flex-direction: row;
}

.metric-row__data {
  display: flex;
  flex-direction: row;
}

.row-split {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.row-split > *:nth-child(1) {
  text-align: left;
}

.row-split > *:nth-child(2) {
  text-align: right;
}

</style>

<script>
import { filterCurrencyCents, filterPercentage } from '../../plugins/filters';

const mirror = (value) => value;

export default {

  data() {
    return {
      metricDisplay: [
        { key: 'usersOptedIn',          label: `Users Opted In`,   displayFunc: mirror },
        { key: 'usersConverted',        label: `Users Converted`,  displayFunc: mirror },
        { key: 'conversionRate',        label: `Conversion Rate`,  displayFunc: value => filterPercentage(value, 1) },
        { key: 'totalDonationAmount',   label: `Total Donations`,  displayFunc: filterCurrencyCents },
        { key: 'averageDonationAmount', label: `Average Donation`, displayFunc: filterCurrencyCents },
        { key: 'amountPerUser',         label: `$ Per User`,       displayFunc: filterCurrencyCents },
      ],

      allMetrics: {
        prompt : [ ],
        sidebar: [ ],
      },

      prices: {
        prompt : [ ],
        sidebar: [ ],
      },

      variationInputs: [
        "",
        "",
        "",
      ],

      selectedMetric: 'prompt',
    };
  },

  computed: {
    metrics() {
      return this.allMetrics[this.selectedMetric];
    },
    selectedPrices() {
      return this.prices[this.selectedMetric];
    },
    lastUpdated() {
      const dates = this.selectedPrices.map(price => price.updated_at);
      if (dates.length === 0) {
        return null;
      }
      dates.sort((a, b) => {
        if (a > b) { return -1; }
        if (a < b) { return 1; }
        return 0;
      });
      console.log('dates', dates);
      return dates[0];
    },
  },

  methods: {
    async loadPricing() {
      const response = await this.$sdk.get(`/donation-pricing/`);
      const responseJson = await response.json();

      this.allMetrics = responseJson.metrics;
      this.prices = responseJson.prices;

      this.selectMetric(this.selectedMetric);
    },

    async update() {
      const changes = this.getVariationDiff();
      await this.applyChanges(changes);
    },

    getVariationDiff() {
      const diff = [];
      const prices = this.prices[this.selectedMetric];
      for (let i = 0; i < this.variationInputs.length; i++) {
        const variation = this.parseVariation(this.variationInputs[i]);

        console.log(`VARIATION FOR ${i}:`, variation);

        if (i >= prices.length) {
          if (variation.length) {
            diff.push('create');
            continue;
          }
          diff.push('noop');
          continue;
        }

        const currValue = variation;
        const prevValue = prices[i].tier_1;
        if (prevValue.length && !currValue.length) {
          diff.push('delete');
          continue;
        }

        if (JSON.stringify(currValue) != JSON.stringify(prevValue)) {
          diff.push('update');
          continue;
        }

        diff.push('noop');
      }

      return diff;
    },

    async applyChanges(changes) {
      const prices = this.prices[this.selectedMetric];
      const promises = [];
      for (let i = 0; i < changes.length; i++) {
        const change = changes[i];

        if (change === 'noop') {
          continue;
        }

        const variation = this.parseVariation(this.variationInputs[i]);

        if (change === 'create') {
          const promise = this.$sdk.post(`/donation-pricing`, {
            placement: this.selectedMetric,
            tier_1: variation,
          });
          promises.push(promise);
          continue;
        }

        if (change === 'update') {
          const id = prices[i].id;
          const promise = this.$sdk.patch(`/donation-pricing/${id}`, {
            tier_1: this.parseVariation(this.variationInputs[i]),
          });
          promises.push(promise);
          continue;
        }

        if (change === 'delete') {
          const id = prices[i].id;
          const promise = this.$sdk.delete(`/donation-pricing/${id}`);
          promises.push(promise);
          continue;
        }
      }

      await Promise.all(promises);
      await this.loadPricing();
    },

    getVariationDisplay(prices) {
      return prices.join(', ');
    },

    parseVariation(variation) {
      console.log(variation.split(','));
      return variation.split(',').filter(x => x.trim()).map(price => parseFloat(price));
    },

    selectMetric(metric) {
      this.selectedMetric = metric;

      this.variationInputs = ['', '', ''];

      const prices = this.prices[metric];
      for (let priceIndex = 0; priceIndex < prices.length; priceIndex++) {
        if (priceIndex > 2) {
          break;
        }

        const price = prices[priceIndex];
        this.variationInputs[priceIndex] = this.getVariationDisplay(price.tier_1);
      }
    },
  },

  async mounted() {
    await this.loadPricing();
  },

};
</script>
