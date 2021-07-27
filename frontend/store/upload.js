import sdk from '../lib/learningful-sdk'
export const state = {
  uploadModal: false,
  step : -1,
  precheckList : [],
  title : '',
  type : '',
  subject : '',
  description : '',
  gradeLevel : {},
  skill : [],
  standard : [],
  readingLevel : '',
  keywords : [],
  upladedFiles : [
    {displayName : "111.pdf", realName : "123.pdf", size : "13MB", status : 1},
    {displayName : "222.pdf", realName : "123.pdf", size : "13MB", status : 0}
  ],
  coverImages : [],
  status : 0,
  prevStatus : 0,
  prevStep : 0
}

export const getters = {
  getUploadModalStatus: state => state.uploadModal,
  getUploadStep : state => state.step,
  getUploadTitle : state => state.title,
  getUploadedFileList : state => state.upladedFiles,
  getCoverImageList : state => state.coverImages,
  getStatus : state => state.status,
  getPreviousStatus : state => state.preStatus,
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
  ADD_UPLOAD_FILE : (state, value) => { state.upladedFiles.push(value) },
  UPDATE_UPLOADED_FILE_STATUS : (state, value) => {
    let temp = state.upladedFiles.slice();
    let length = temp.length;
    temp[length-1] = { ...temp[length-1], ...value };
    state.upladedFiles = temp;
  },
  DELETE_UPLOADED_FILE : (state, value) => { state.upladedFiles.splice(value, 1) },
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
  SET_PREVIOUS_STATUS : (state, value) => { state.prevStatus = value }
}

export const actions = {
  async uploadFile({commit, state}, file) {
    try{
      const formdata = new FormData();
      formdata.append('file', file);
      
      let displayName = file.name;
      commit('ADD_UPLOAD_FILE', {displayName , status : 0, filesize : file.size});
      const res = await this.$sdk.post('/upload/fileUpload', formdata);
      const body = await res.json();
      let realName = body.filename;

      commit('UPDATE_UPLOADED_FILE_STATUS', {realName, status : 1});

    }catch(e){
      console.log(e.response);
    }
  },
  async delUploadedFile({commit, state}, index) {
    try{
      const res = await this.$sdk.post('upload/delUploadedFile', {filename : state.upladedFiles[index].realName});
      const body = await res.json();
      commit('DELETE_UPLOADED_FILE', index);

    }catch(e){
      console.log(e.response);
    }
  },
  async uploadCoverImage({commit, state}, file){
    try{
      let base64 = await new Promise((resolve)=>{
        let reader = new FileReader();
        reader.onload = async (e)=>{
            resolve(reader.result);
        };
        reader.readAsDataURL(file);
      })
      let displayName = file.name;
      commit('ADD_COVER_IMAGE', {displayName, filesize : file.size, status : 0});
      
      const formdata = new FormData();
      formdata.append('file', file);
      // const res = await this.$sdk.post('/upload/fileUpload', formdata);
      // const body = await res.json();
      // let realName = body.filename;

      commit('UPDATE_COVER_IMAGE_STATUS', { /*realName,*/ status : 1, source : base64});
    }catch(e){
      console.log(e.response);
    }
  },
  async delUploadedCoverImage({commit, state}, index){
    try{
      // const res = await this.$sdk.post('upload/delUploadedCoverImage', {filename : state.coverImages[index].realName});
      // const body = await res.json();
      commit('DELETE_UPLOADED_COVER_IMAGE', index);

    }catch(e){
      console.log(e.response);
    }
  },
  async submitResource({commit, state}) {
    try {
      let data = {...state};
      delete data.uploadModal;
      delete data.step;

      const res = await this.$sdk.post('/upload/submitResource', data);
      const body = await res.json();
      console.log(body)

      commit('SET_STATUS', 1);
    } catch (e) {
      console.log(e.response)
    }
  },
  async deleteResource({commit, state}){
    
  }

}
