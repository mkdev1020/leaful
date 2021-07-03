import sdk from '../lib/learningful-sdk'
export const state = {
  uploadModal: false
}

export const getters = {
  getUploadModalStatus: state => state.uploadModal
}

export const mutations = {
  SET_UPLOAD_MODAL: (state, value) => { state.uploadModal = value },
}

export const actions = {
  async submitDraft({commit}, data, callback) {
    try {
      const response = await this.$sdk.post('/upload/submit', data);
      const body = await response.json();
      console.log(body)

      callback(body);
    } catch (exceptions) {
      console.log(exceptions.response)
    }
  },
}
