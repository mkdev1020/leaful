
import { DateTime } from 'luxon';

const requestLimitDefault = {
  isExceeded    : false,
  earliestRetry : null,
  isLocked      : false,
  url: null,
  secondsRemaining: 0,
  secondsRemainingInterval: 0,
  isAdmin: false,
};

export const state = () => ({
  accessToken: null,
  isAuthPromptShowing: false,
  postAuthRedirect: null,
  postAuthReload: false,
  requestLimit: Object.assign({}, requestLimitDefault),
});

export const getters = () => ({
});

export const mutations = {

  set(state, values) {
    for (const [key, val] of Object.entries(values)) {
      state[key] = val;
    }
  },

  loadFromLocalStorage(state) {
    const jsonDataString = window.localStorage.getItem('store/main');
    if (!jsonDataString) {
      return;
    }
    const jsonData = JSON.parse(jsonDataString);
    state.accessToken = jsonData.accessToken;
    state.isAdmin = jsonData.isAdmin
  },

  saveToLocalStorage(state) {
    const jsonDataString = JSON.stringify(state);
    window.localStorage.setItem('store/main', jsonDataString);
  },

  setAccessToken(state, token) {
    state.accessToken = token;
  },

  promptAuthentication(state, bool = true) {
    state.isAuthPromptShowing = bool;
  },

  setRequestLimit(state, limit) {
    state.requestLimit = limit;
  },

  setPostAuthRedirect(state, redirect) {
    state.postAuthRedirect = redirect;
  },

  parseJwt (state, token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    let data = JSON.parse(jsonPayload)
    console.log(data, data.scopes, data.scopes.includes('admin'))
    if (data.scopes.includes('admin')) {
      state.isAdmin = true
    }
  }

};

function getSecondsRemaining(date) {
  return parseInt(DateTime.fromISO(date)
    .diff(DateTime.now().toUTC())
    .as('seconds'))
}

export const actions = {

  setRequestLimitExceeded(context, limit) {
    window.clearInterval(context.state.requestLimit.secondsRemainingInterval);

    const requestLimit = Object.assign({}, limit);
    context.commit('setRequestLimit', requestLimit);

    if (requestLimit.isLocked) {
      return;
    }

    requestLimit.secondsRemainingInterval = window.setInterval(
      () => {
        const secondsRemaining = getSecondsRemaining(requestLimit.earliestRetry);

        if (secondsRemaining <= 0) {
          context.dispatch('clearRequestLimitExceeded');
          return;
        }

        context.commit('setRequestLimit', Object.assign({}, context.state.requestLimit, { secondsRemaining }));
      },
      1000
    );

    const secondsRemaining = getSecondsRemaining(requestLimit.earliestRetry);
    context.commit('setRequestLimit', Object.assign({}, requestLimit, { secondsRemaining }));
  },

  clearRequestLimitExceeded(context) {
    window.clearInterval(context.state.requestLimit.secondsRemainingInterval);

    context.commit('setRequestLimit', Object.assign({}, requestLimitDefault));
  },

  finishAuthentication(context) {
    if (context.state.postAuthReload) {
      // reload
      $nuxt.$router.go();
      return;
    }

    $nuxt.$router.push(context.state.postAuthRedirect);

    context.commit('set', {
      isAuthPromptShowing: false,
      postAuthRedirect: null,
      postAuthReload: false,
    });
  },

};
