<template>
  <div>
    <div class="info-line">
      <div v-if="!infoLineText">
        Exceptions:

        <span
          v-for="exception in exceptionTypes"
          :key="exception.type"
        >
          <b>{{ exception.type | capitalize }}</b>
          <a
            class="link link--exception"
            :class="{ 'selected': isExceptionTypeSelected(exception.type) }"
            @click="() => { $router.push(`/admin/exceptions/${exception.type}`) }"
          >{{
            exception.getCount()
          }}</a> |
        </span>
      </div>
      <div v-else v-html="infoLineText" />
    </div>

    <div class="divider-h" />
    <div class="stats-strip">
      <div class="stats-strip__content">
        <NuxtChild />
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

<style scoped>
.link--exception {
  font-weight: bold;
  text-decoration: none;
}

.link.selected {
  text-decoration: underline;
}
</style>

<script>

export default {
  data() {
    return {
      infoLineText: '',
      infoLineTimeout: null,

      exceptionTypes: [
        { type: 'advertising', getCount: () => { return this.$store.state.exceptions.advertisements.length; } },
        { type: 'payouts'    , getCount: () => { return this.$store.state.exceptions.payouts.length; } },
        { type: 'publishing' , getCount: () => { return this.$store.state.exceptions.resources.length; } },
        { type: 'support'    , getCount: () => { return this.$store.state.exceptions.supportThreads.length; } },
      ],
    };
  },

  computed: {
  },

  methods: {
    isExceptionTypeSelected(type) {
      return this.$route.path.includes(`/exceptions/${type}`);
    },

    async loadInquiries() {
      const response = await this.$sdk.get('/help/inquiries');
      const responseJson = await response.json();
      console.log(responseJson)
      this.$store.commit('exceptions/cacheUsers', responseJson.users);
      this.$store.commit('exceptions/set', {
        supportThreads: responseJson.threads,
      });
    },

    async loadPayouts() {
      const response = await this.$sdk.get('/payouts/pending');
      const responseJson = await response.json();
      this.$store.commit('exceptions/cacheUsers', responseJson.users);
      this.$store.commit('exceptions/set', {
        payouts: responseJson.payouts,
        totalEligiblePayouts: responseJson.totalEligiblePayouts,
      });
    },

    async loadAdvertisements() {
      // TODO TODO TODO
      // accommodate resource feature within the advertising exceptions

      const response = await this.$sdk.get('/advertisements/pending');
      const responseJson = await response.json();

      this.$store.commit('exceptions/cacheUsers', responseJson.users);
      this.$store.commit('exceptions/set', {
        advertisements: responseJson.advertisements,
      });
    },

    async loadResources() {
      const response = await this.$sdk.get('/resources/pending');
      const responseJson = await response.json();

      this.$store.commit('exceptions/cacheUsers', responseJson.users);
      this.$store.commit('exceptions/set', {
        resources: responseJson.resources,
      });
    },

    getArrayWithOldestException() {
      const arrayNames = ['advertisements', 'payouts', 'resources', 'supportThreads'];
      let arrayWithOldestException = 'advertisements';
      let oldestExceptionDate = null;
      for (const arrName of arrayNames) {
        const arr = this.$store.state.exceptions[arrName];
        if (arr.length === 0) {
          continue;
        }

        const exceptionDate = arr[0].created_at;
        if (exceptionDate < oldestExceptionDate || oldestExceptionDate === null) {
          oldestExceptionDate = exceptionDate;
          arrayWithOldestException = arrName;
        }
      }
      return arrayWithOldestException;
    },

    routeToOldestException() {
      const routeForArrName = {
        supportThreads  : 'support',
        payouts         : 'payouts',
        advertisements  : 'advertising',
        resources       : 'resources',
      };

      const arr = this.getArrayWithOldestException();
      $nuxt.$router.push(`/admin/exceptions/${routeForArrName[arr]}`);
    },

  },

  async mounted() {
    await Promise.all([
      this.loadInquiries(),
      this.loadPayouts(),
      this.loadAdvertisements(),
      this.loadResources(),
    ]);

    // don't route if sub-route is already specified
    if (this.$route.path === '/admin/exceptions') {
      this.routeToOldestException();
    }
  },
};

</script>

<style>
.exception_divider {
  min-width: 2px;
  max-width: 2px;
  width: 2px;
  margin: 0 18px;
  height: 115px;
  background: var(--col-captcha-verify-border-disabled);
}
</style>
