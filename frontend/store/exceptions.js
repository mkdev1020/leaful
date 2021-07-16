
export const state = () => ({
  supportThreads: [],
  supportThreadIndex: 0,

  supportMessageIndexAdmin: 0,
  supportMessageIndexTeacher: 0,

  responseBoxShowing: false,
  responseBody: '',

  users: [],

  payouts: [],
  totalEligiblePayouts: 0,

  advertisements: [],
  advertisementIndex: 0,
  adCommentBody: '',

  resources: [],
  resourcesIndex: 0,
  resourcesCommentBody: 0,
});

export const getters = {
  usersById(state) {
    const usersById = {};
    for (const user of state.users) {
      usersById[user.id] = user;
    }
    return usersById;
  },
};

export const mutations = {

  set(state, values) {
    for (const [key, val] of Object.entries(values)) {
      state[key] = val;
    }
  },

  clearSelectedThread(state) {
    state.supportThreads.splice(state.supportThreadIndex, 1);
  },

  skipSupportThread(state) {
    state.supportThreads.splice(state.supportThreadIndex, 1);
  },

  clearSelectedAdvertisement(state) {
    state.advertisements.splice(state.advertisementIndex, 1);
    state.adCommentBody = '';
  },

  clearSelectedResource(state) {
    state.resources.splice(state.resourcesIndex, 1);
    state.resourceCommentBody = '';
  },

  cacheUsers(state, users) {
    for (const user of users) {
      state.users.push(user);
    }
  },

};
