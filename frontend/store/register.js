import sdk from '../lib/learningful-sdk'
export const state = {
  modal: false,
  list: [],
}

export const getters = {
  getModalStatus: state => state.modal,
  getHelpCenterList: state => state.list,
}

export const mutations = {
  SET_MODAL: (state, value) => { state.modal = value },
  SET_HELP_CENTER_LIST: (state, value) => { state.list = value },
  ADD_ITEM_TO_LIST: (state, value) => { state.list.push(value) },
  UPDATE_ITEM_TO_LIST: (state, value) => { state.list.splice(value.index, 1, value) },
  DELETE_ITEM_FROM_LIST: (state, value) => { state.list.splice(value.index, 1) },
}

export const actions = {
  async fetchList({commit}) {
    try {
      const response = await this.$sdk.get('/help/random-pro-tip');
      const body = await response.json();
      console.log(body)
      commit('SET_HELP_CENTER_LIST', body.proTip)
    } catch (exceptions) {
      console.log(exceptions.response)
    }
  },

  async storeItem({commit}, item) {
    try {
      const response = await this.$sdk.post('/help', item)
      commit('ADD_ITEM_TO_LIST', item)
      console.log(response)
    } catch (exceptions) {
      console.log(exceptions.response)
    }
  },

  async submitFeedback({commit}, item) {
    try {
      const response = await this.$sdk.post('/help/feedback', { feedback: item })
      console.log(response)
    } catch (exceptions) {
      console.log(exceptions.response)
    }
  },

  async updateItem({commit}, item) {
    try {
      const response = await this.$sdk.put(`/help/${item.id}`, item)
      commit('UPDATE_ITEM_TO_LIST', item)
      console.log(response)
    } catch (exceptions) {
      console.log(exceptions.response)
    }
  },

  async deleteItem({commit}, item) {
    try {
      const response = await this.$sdk.delete(`/help/${item.id}`)
      commit('DELETE_ITEM_FROM_LIST', item)
      console.log(response)
    } catch (exceptions) {
      console.log(exceptions.response)
    }
  },

}
