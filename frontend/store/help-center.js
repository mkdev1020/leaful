export const state = {
  helpCenterModal: false,
  list: [],
  index: 0,
}

export const getters = {
  getHelpCenterModalStatus: state => state.helpCenterModal,
  getHelpCenterList: state => state.list,
}

export const mutations = {
  SET_HELP_CENTER_MODAL: (state, value) => { state.helpCenterModal = value },
  SET_HELP_CENTER_LIST: (state, value) => { state.list = value },
  ADD_ITEM_TO_LIST: (state, value) => { state.list.push(value) },
  UPDATE_ITEM_TO_LIST: (state, value) => { state.list.splice(value.index, 1, value) },
  DELETE_ITEM_FROM_LIST: (state, value) => { state.list.splice(value.index, 1) },
  SET_CURRENT_INDEX: (state, value) => { state.index = value },
  SORT_LIST: (state) => {
    state.list = state.list.sort(function (a, b) {
      return a.order_index - b.order_index;
    })
  }
}

export const actions = {
  async fetchList({commit}) {
    try {
      const response = await this.$sdk.get('/help/');
      const body = await response.json();
      await commit('SET_HELP_CENTER_LIST', body.entries)
      await commit('SORT_LIST')
    } catch (exceptions) {
      console.log(exceptions.response)
    }
  },

  async storeItem({commit}, item) {
    try {
      const response = await this.$sdk.post('/help', item)
      await commit('ADD_ITEM_TO_LIST', item)
      await commit('SORT_LIST')
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
      await commit('SET_CURRENT_INDEX', item.index)
      const response = await this.$sdk.put(`/help/${item.id}`, item)
      const data = await response.json().item
      data.index = item.index
      // item.image = `/${item.image_locator}`
      // item.image_locator = `/${item.image_locator}`
      await commit('UPDATE_ITEM_TO_LIST', data)
      await commit('SORT_LIST')
    } catch (exceptions) {
      console.log(exceptions.response)
    }
  },

  async deleteItem({commit}, item) {
    try {
      const response = await this.$sdk.delete(`/help/${item.id}`)
      await commit('DELETE_ITEM_FROM_LIST', item)
      await commit('SORT_LIST')

      // console.log(response)
    } catch (error) {
      console.log(error)
      console.log(error.response)
    }
  },

}
