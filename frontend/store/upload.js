import sdk from '../lib/learningful-sdk'
export const state = {
  uploadModal: false,
  step : -1,
  precheck_list : [],
  title : '',
  type : ''
}

export const getters = {
  getUploadModalStatus: state => state.uploadModal,
  getUploadStep : state => state.step
}

export const mutations = {
  SET_UPLOAD_MODAL: (state, value) => { state.uploadModal = value },
  GOTO_NEXT_UPLOAD_STEP : (state) => { state.step++; },
  SET_UPLOAD_PRECHECK_LIST : (state, value) => { state.precheck_list = value },
  SET_UPLOAD_TITLE : (state, value) => { state.title = value },
  SET_UPLOAD_TYPE : (state, value) => { state.type = value }
}

export const actions = {
  async submitDraft({commit, state}, callback) {
    try {
      let data = {
        precheck_list : state.precheck_list,
      }
      const response = await this.$sdk.post('/upload/submit', data);
      const body = await response.json();
      console.log(body)

      callback(body);
    } catch (exceptions) {
      console.log(exceptions.response)
    }
  },


}
