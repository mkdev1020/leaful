import sdk from '../lib/learningful-sdk'
export const state = {
  uploadModal: false,
  step : -1,
  resourceID : '',
  precheckList : [],
  title : '',
  type : '',
  subject : '',
  description : '',
  gradeLevel : '',
  skill : [],
  standard : [],
  readingLevel : '',
  keywords : [],
  uploadedFiles : [],
  coverImages : [],
  status : 0,
  prevStep : 0
}

export const getters = {
  getUploadModalStatus: state => state.uploadModal,
  getUploadStep : state => state.step,
  getUploadTitle : state => state.title,
  getUploadedFileList : state => state.uploadedFiles,
  getCoverImageList : state => state.coverImages,
  getStatus : state => state.status,
  getPreviousStep : state => state.prevStep
}

export const mutations = {
  SET_UPLOAD_MODAL: (state, value) => { state.uploadModal = value },
  GOTO_NEXT_UPLOAD_STEP : (state) => { state.step++; },
  SET_UPLOAD_STEP : (state, value) => { state.step = value },
  SET_UPLOAD_PREVIOUS_STEP : (state, value) => { state.prevStep = value },
  SET_UPLOAD_PRECHECK_LIST : (state, value) => { state.precheckList = value },
  SET_UPLOAD_TITLE : (state, value) => { state.title = value },
  SET_UPLOAD_TYPE : (state, value) => { state.type = value },
  SET_UPLOAD_SUBJECT : (state, value) => { state.subject = value },
  SET_UPLOAD_DESCRIPTION : (state, value) => { state.description = value },
  SET_UPLOAD_GRADE_LEVEL : (state, value) => { state.gradeLevel = value },
  SET_UPLOAD_SKILL : (state, value) => { state.skill = value },
  SET_UPLOAD_STANDARD : (state, value) => { state.standard = value },
  SET_UPLOAD_READING_LEVEL : (state, value) => { state.readingLevel = value },
  SET_UPLOAD_KEYWORDS : (state, value) => { state.keywords = value },
  ADD_UPLOAD_FILE : (state, value) => { state.uploadedFiles.push(value) },
  UPDATE_UPLOADED_FILE_STATUS : (state, value) => {
    let temp = state.uploadedFiles.slice();
    let length = temp.length;
    temp[length-1] = { ...temp[length-1], ...value };
    state.uploadedFiles = temp;
  },
  DELETE_UPLOADED_FILE : (state, value) => { state.uploadedFiles.splice(value, 1) },
  ADD_COVER_IMAGE : (state, value) => { state.coverImages.push(value) },
  UPDATE_COVER_IMAGE_STATUS : (state, value) => {
    let temp = state.coverImages.slice();
    let length = temp.length;
    temp[length-1] = { ...temp[length-1], ...value };
    state.coverImages = temp;
  },
  DELETE_UPLOADED_COVER_IMAGE : (state, value) => { state.coverImages.splice(value, 1) },
  SET_PREVIEW_COVER_IMAGE : (state, value) => {
    let temp = state.coverImages.slice();
    for(let one of temp)
      one.status = 1;
    temp[value].status = 2;
    state.coverImages = temp;
  },
  SET_STATUS : (state, value) => { state.status = value },
  SET_RESOURCE_ID : (state, value) => { state.resourceID = value }
}

export const actions = {
  async uploadFile({commit, state}, file) {
    try {
      commit('ADD_UPLOAD_FILE', {
        displayName: file.name,
        status : 0,
        filesize : file.size
      });
      let base64 = await new Promise((resolve) => {
        let reader = new FileReader();
        reader.onload = async (e) => {
            resolve(reader.result);
        };
        reader.readAsDataURL(file);
      });
      commit('UPDATE_UPLOADED_FILE_STATUS', { base64, status : 1 });

    } catch(e){
      console.log(e.response);
    }
  },
  async delUploadedFile({commit, state}, index) {
    try {
      commit('DELETE_UPLOADED_FILE', index);
    } catch(e){
      console.log(e.response);
    }
  },
  async uploadCoverImage({commit, state}, file) {
    try {
      let base64 = await new Promise((resolve) => {
        let reader = new FileReader();
        reader.onload = async (e) => {
            resolve(reader.result);
        };
        reader.readAsDataURL(file);
      })
      commit('ADD_COVER_IMAGE', {
        displayName: file.name,
        filesize : file.size,
        status : 1,
        base64
      });

    } catch(e) {
      console.log(e.response);
    }
  },
  async delUploadedCoverImage({commit, state}, index) {
    try{
      // const res = await this.$sdk.post('upload/delUploadedCoverImage', {filename : state.coverImages[index].realName});
      // const body = await res.json();
      commit('DELETE_UPLOADED_COVER_IMAGE', index);

    }catch(e){
      console.log(e.response);
    }
  },
  async submitResource({commit, state}, userId) {
    try {
      let data = {
        users_id : userId,
        // precheckList : state.precheckList,
        title : state.title,
        type : state.type,
        subject : state.subject,
        description : state.description,
        gradeLevel : state.gradeLevel.text,
        skills : state.skill,
        standards : state.standard,
        readingLevel : state.readingLevel,
        keywords : state.keywords,
        approval_status : "awaiting_approval"
      }

      const res = await this.$sdk.post('/resources', data);
      const body = await res.json();

      let resource_id = body.item.id;
      for(let i=0; i < state.uploadedFiles.length; i++){
        let file = state.uploadedFiles[i];
        this.$sdk.post(`/resources/${resource_id}/files`, {
          file : file.base64,
          name : file.displayName
        });
      }
      for (let i=0; i < state.coverImages.length; i++) {
        let file = state.coverImages[i];
        this.$sdk.post(`/resources/${resource_id}/resources-preview`, {
          file : file.base64,
          name : file.displayName,
          selected : file.status - 1
        });
      }
      commit('SET_RESOURCE_ID', resource_id);
      commit('SET_STATUS', 1);
    }catch(err) {
      console.log(err.response)
    }
  },
  async deleteResource({commit, state}) {
    try {
      const res = await this.$sdk.delete(`/resources/${state.resourceID}`);
      const body = await res.json();

      commit('SET_UPLOAD_STEP', 14);
    } catch(e) {
      console.log(e.response);
    }
  },
  async cancelSubmitResource({commit, state}) {
    try{
      const res = await this.$sdk.post(`/resources/${state.resourceID}/cancel`, {});
      const body = await res.json();

      commit('SET_STATUS', 0);
    } catch(e) {
      console.log(e.response);
    }
  },
  async deactivateResource({commit, state}) {
    try{
      const res = await this.$sdk.post(`/resources/${state.resourceID}/deactivate`, {});
      const body = await res.json();

      commit('SET_STATUS', 5);
    } catch(e) {
      console.log(e.response);
    }
  },
  async reactivateResource({commit, state}) {
    try{
      const res = await this.$sdk.post(`/resources/${state.resourceID}/reactivate`, {});
      const body = await res.json();

      commit('SET_STATUS', 2);
    } catch(e) {
      console.log(e.response);
    }
  }

}
