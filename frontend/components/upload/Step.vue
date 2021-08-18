<template>
  <div class="step-container">
    <div class="title">New Resource: <span>Step {{step}}</span></div>
    <div class="step-body">
      <div v-if="step === 1">
        <div class="sub-title"><span>Give it a catchy title.</span></div>
        <input class="text-form lg-text" type="text" placeholder="Title" v-model="title"/>
        <div class="error-text">
          <template v-if="$v.title.$error">
            <span v-if="!$v.title.required">Field is required</span>
            <span v-else-if="!$v.title.maxLength">Name must have at most {{ titleValidation }} letters.</span>
          </template>
        </div>
        <div class="hint-text">
          <span>
            Ideally, the title of your resource should also be present on your cover
            image. Keep it short and sweet.
            <br><br>
            40 characters max.
          </span>
        </div>
      </div>
      <div v-if="step === 2">
        <div class="sub-title"><span>Add a subtitle that categorizes it.</span></div>
        <input class="text-form lg-text" type="text" placeholder="Resource Type" v-model="type"/>
        <div class="error-text">
          <template v-if="$v.type.$error">
            <span v-if="!$v.type.required">Field is required</span>
            <span v-else-if="!$v.type.maxLength">Resource Type must have at most {{ resourceValidation }} letters.</span>
          </template>
        </div>
        <div class="hint-text">
          <span>
            In 2 or 3 words identify what this resource is. Answer this question:
            "This resource is a/an________________."
            <br><br>
            25 characters max.
          </span>
        </div>
      </div>
      <div v-if="step === 3">
        <div class="sub-title"><span>Academic subject area?</span></div>
        <input class="text-form lg-text" type="text" placeholder="Subject Area" v-model="subject"/>
        <div class="error-text">
          <template v-if="$v.subject.$error">
            <span v-if="!$v.subject.required">Field is required</span>
            <span v-else-if="!$v.subject.maxLength">Resource Type must have at most {{ subjectValidation }} letters.</span>
          </template>
        </div>
        <div class="hint-text">
          <span>
            This will display on the banner for the listing. If no subject
            directly applies, choose a descriptive term.
            <br><br>
            15 characters max.
          </span>
        </div>
      </div>
      <div v-if="step === 4">
        <div class="sub-title"><span>Describe it in detail.</span></div>
        <textarea class="description-text" placeholder="Description" v-model="description"/>
        <div class="error-text">
          <template v-if="$v.description.$error">
            <span v-if="!$v.description.required">Field is required</span>
            <span v-else-if="!$v.description.minLength">Resource Type must have at least {{$v.description.$params.minLength.min}} letters.</span>
            <span v-else-if="!$v.description.maxLength">Resource Type must have at most {{$v.description.$params.maxLength.max}} letters.</span>
          </template>
        </div>
        <div class="hint-text">
          <span>
            Explain what this resource is and elaborate on how these materials minLength
            ultimately be useful to teachers.
            <br><br>
            100 characters min, 1000 max.
          </span>
        </div>
      </div>
      <div v-if="step === 5">
        <div class="sub-title"><span>Ideal grade level.</span></div>
        <div class="form-container">
          <template v-for="(item, index) in gradeLevel">
            <button :class="{'grade-level-btn' : 1, 'selected' : item.value}"
                    :key="`grade_+${index}`"
                    @click="clickGradeLevel(index)">
              {{item.text}}
            </button>
          </template>
        </div>
        <div class="error-text">
          <span v-if="selLevelIdx === -1">You must select at least one Grade Level.</span>
        </div>
        <div class="hint-text">
          <span>
            Select 1 grade level that you feel is the most ideal fit for this resource, even if
            it can be used at multiple levels.
          </span>
        </div>
      </div>
      <div v-if="step === 6">
        <div class="sub-title"><span>Skills (Optional)</span></div>
        <div class="form-container">
          <input v-for="(item, index) in skill"
                 :key="`skill_${index}`"
                 class="text-form md-text" type="text"
                 :placeholder="`Skill ${index+1}`"
                 v-model="item.value"/>
        </div>
        <div class="error-text">
          <span v-if="$v.skill.$error">Skill must have at most {{ skillValidation }} letters.</span>
        </div>
        <div class="hint-text">
          <span>
            Enter up to 4 academic or life skill bases that this resource
            may help teachers address with their students.
            <br><br>
            20 characters max.
          </span>
        </div>
      </div>
      <div v-if="step === 7">
        <div class="sub-title"><span>Standards (Optional)</span></div>
        <div class="form-container">
          <input v-for="(item, index) in standard"
                 :key="`standard_${index}`"
                 class="text-form md-text" type="text"
                 :placeholder="`Standard ${index+1}`"
                 v-model="item.value"/>
        </div>
        <div class="error-text">
          <span v-if="$v.standard.$error">Standard must have at most {{ standardValidation }} letters.</span>
        </div>
        <div class="hint-text">
          <span>
            Enter up to 4 learning standards that this resource may help
            teachers address with their students.
            <br><br>
            20 characters max.
          </span>
        </div>
      </div>
      <div v-if="step === 8">
        <div class="sub-title"><span>Reading Level (Optional)</span></div>
        <input class="text-form lg-text" type="text" placeholder="Lexile, Guided Reading, DRA, etc." v-model="readingLevel"/>
        <div class="error-text">
          <template v-if="$v.readingLevel.$error">
            <span v-if="!$v.readingLevel.maxLength">Reading Level must have at most {{ resourceValidation }} letters.</span>
          </template>
        </div>
        <div class="hint-text">
          <span>
            If applicable and known, enter the reading level for your resource.
            Separate multiple levels with commas.
            <br><br>
            40 characters max.
          </span>
        </div>
      </div>
      <div v-if="step === 9">
        <div class="sub-title"><span>Keywords (Optional)</span></div>
        <div class="form-container">
          <input v-for="(item, index) in keywords"
                 :key="`keyword_${index}`"
                 class="text-form md-text" type="text"
                 :placeholder="`Keyword ${index+1}`"
                 v-model="item.value"/>
        </div>
        <div class="error-text">
          <span v-if="$v.keywords.$error">Keyword must have at most {{ keywordValidation }} letters.</span>
        </div>
        <div class="hint-text">
          <span>
            Enter up to 4 keywords that may help teachers searching for
            resources like this one, to find it more easily.
            <br><br>
            20 characters max.
          </span>
        </div>
      </div>
      <div v-if="step === 10">
        <div class="sub-title"><span>Select files to include.</span></div>
        <div class="files-container">
          <div>
            <template v-for="(item, index) in twoUploadedFiles">
              <div :key="`file_${index}`"
                   :class="['file-item', (item.status ? 'uploaded' : 'uploading')]">
                <div class="filename-text"><span>{{item.displayName}}</span></div>
                <div class="divider"><span>l</span></div>
                <div class="status-text">
                  <span v-if="item.status === 1">{{item.size}}</span>
                  <span v-else>Uploading...</span>
                </div>
                <button v-if="item.status === 1" class="del-file-btn" @click="delUploadedFile(index)">X</button>
              </div>
            </template>
            <button v-if="uploadedFiles.length <= 12"
                    class="upload-btn"
                    @click="$refs.file.click()">
              Select File {{uploadedFiles.length + 1}}
            </button>
            <input type="file" ref="file" @change="changeSelectFile()" hidden/>
          </div>
          <div v-if="uploadedFiles.length > 2">
            <button :class="['arrow-btn', 'arrow-up-btn', (file.displayIndex === 0 ? 'disabled' : '')]"
                    @click="updateDisplayIndex(1)"></button>
            <button :class="['arrow-btn', 'arrow-down-btn', (file.displayIndex + 2 >= uploadedFiles.length ? 'disabled' : '')]"
                    @click="updateDisplayIndex(-1)"></button>
          </div>
        </div>
        <div class="error-text">
          <span v-if="$v.uploadedFiles.$error && !$v.uploadedFiles.required">Attach File Required.</span>
        </div>
        <div class="hint-text">
          <span>
            You may include up to 12 files in your resource, which will be
            combined into a zip file for publication.
            <br><br>
            100MB combined limit.
          </span>
        </div>
      </div>
      <div v-if="step === 11">
        <div class="sub-title"><span>Set preview images.</span></div>
        <div class="coverImage-container">
          <div class="coverImage-item-list">
            <template v-for="(item, index) in threeUploadedCoverImages">
              <div :key="`coverImage_${index}`"
                   :class="['coverImage-item', (item.status === 2 ? 'preview' : '')]">
                <img :src="item.base64" @click="selectPreviewCoverImage(index)" />
                <button v-if="item.status > 0" class="del-coverImage-btn" @click="delUploadedCoverImage(index)">X</button>
              </div>
            </template>
            <button v-if="coverImages.length === 0"
                    class="upload-btn"
                    @click="$refs.imageFile.click()">
              Select Cover Image
            </button>
            <input type="file" ref="imageFile" @change="changeSelectCoverImageFile()" hidden/>
          </div>
          <div v-if="coverImages.length > 3">
            <button :class="['arrow-btn', 'arrow-up-btn', (coverImage.displayIndex === 0 ? 'disabled' : '')]"
                    @click="updateCoverImageDisplayIndex(1)"></button>
            <button :class="['arrow-btn', 'arrow-down-btn', (coverImage.displayIndex + 3 >= coverImages.length ? 'disabled' : '')]"
                    @click="updateCoverImageDisplayIndex(-1)"></button>
          </div>
        </div>
        <div class="error-text">
          <span v-if="$v.coverImages.$error && !$v.coverImages.required">Attach File Required.</span>
        </div>
        <div class="hint-text">
          <span v-if="coverImages.length === 0">
            You may have up to 4 preview images, which should all have the approximate proportion
            of a standard document.
            <br><br>
            680 x 880 min. 1MB max.
          </span>
          <span v-else>
            Select a page that we have pulled from the PDF files you have
            uploaded as part of this resource, or
            <a class="del-link" @click="coverImages.length < 4 ? $refs.imageFile.click() : ''">Upload a New Image.</a>
          </span>
        </div>
      </div>
      <Preview :src="selCoverIdx === -1 ? '' : coverImages[selCoverIdx]" />
    </div>
    <div class="control-div">
      <span>
        <span>Uploading: </span>
        <b v-if="title === ''">Untitled Resource</b>
        <b v-else>{{ this.title }}</b>
        <span v-if="step > 1">l <a class="del-link" @click="deleteResource()">Delete</a></span>
      </span>
      <div>
        <button class="next-step-btn" @click="nextStep()">Next</button>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import { validationMixin } from "vuelidate";
import { required, minLength, maxLength } from "vuelidate/lib/validators";
import { gradeLevel } from "~/lib/consts";
import Preview from "./Preview";

export default {
  mixins : [validationMixin],
  components : {
    Preview
  },
  data(){
    return {
      title : '',
      type : '',
      subject : '',
      description : '',
      gradeLevel,
      selLevelIdx : 0,
      skill : [
        { value : '' },
        { value : '' },
        { value : '' },
        { value : '' }
      ],
      standard : [
        { value : '' },
        { value : '' },
        { value : '' },
        { value : '' }
      ],
      readingLevel : '',
      keywords : [
        { value : '' },
        { value : '' },
        { value : '' },
        { value : '' }
      ],
      /**  Uploading Files Step  **/
      file : {
        displayIndex : 0
      },
      /** Uploading CoverImage Step **/
      coverImage : {
        displayIndex : 0
      }
    }
  },
  validations : {
    title : {
      required,
      maxLength : maxLength(40)
    },
    type : {
      required,
      maxLength : maxLength(25)
    },
    subject : {
      required,
      maxLength : maxLength(15)
    },
    description : {
      required,
      minLength : minLength(100),
      maxLength : maxLength(1000)
    },
    skill : {
      $each : {
        value : {
          maxLength : maxLength(20)
        }
      }
    },
    standard : {
      $each : {
        value : {
          maxLength : maxLength(20)
        }
      }
    },
    readingLevel : {
      maxLength : maxLength(40)
    },
    keywords : {
      $each : {
        value : {
          maxLength : maxLength(20)
        }
      }
    },
    uploadedFiles : {
      required
    },
    coverImages : {
      required(value) {
        let result = value.filter((one, index) => one.status === 2);
        return result.length;
      }
    }
  },
  computed : {
    ...mapGetters({
      step : "upload/getUploadStep",
      uploadedFiles : "upload/getUploadedFileList",
      coverImages : "upload/getCoverImageList"
    }),
    twoUploadedFiles() {
      let len = this.uploadedFiles.length;
      let end = this.file.displayIndex + 2 > len ? len : this.file.displayIndex + 2;

      return this.uploadedFiles.slice(this.file.displayIndex, end);
    },
    threeUploadedCoverImages() {
      let len = this.coverImages.length;
      let end = this.coverImage.displayIndex + 3 > len ? len : this.coverImage.displayIndex + 3;

      return this.coverImages.slice(this.coverImage.displayIndex, end);
    },
    selCoverIdx() {
      for (let i = 0; i < this.coverImages.length; i++) {
        if (this.coverImages[i].status === 2)
          return i;
      }

      return -1;
    },
    titleValidation() {
      return this.$v.title.$params.maxLength.max
    },
    resourceValidation() {
      return this.$v.type.$params.maxLength.max
    },
    subjectValidation() {
      return this.$v.subject.$params.maxLength.max
    },
    skillValidation() {
      return this.$v.skill.$each[0].value.$params.maxLength.max
    },
    standardValidation() {
      return this.$v.standard.$each[0].value.$params.maxLength.max
    },
    readingLevelValidation() {
      return this.$v.readingLevel.$params.maxLength.max
    },
    keywordValidation() {
      return this.$v.keywords.$each[0].value.$params.maxLength.max
    }
  },
  methods : {
    nextStep() {
      switch (this.step) {
        case 1:
          this.$v.title.$touch();
          if (this.$v.title.$invalid)
            return;
          this.$store.commit('upload/SET_UPLOAD_TITLE', this.title);
          break;
        case 2:
          this.$v.type.$touch();
          if (this.$v.type.$invalid)
            return;
          this.$store.commit('upload/SET_UPLOAD_TYPE', this.type);
          break;
        case 3:
          this.$v.subject.$touch();
          if (this.$v.subject.$invalid)
            return;
          this.$store.commit('upload/SET_UPLOAD_SUBJECT', this.subject);
          break;
        case 4:
          this.$v.description.$touch();
          if (this.$v.description.$invalid)
            return;
          this.$store.commit('upload/SET_UPLOAD_DESCRIPTION', this.description);
          break;
        case 5:
          this.selLevelIdx = this.validateGradeLevel();
          if (this.selLevelIdx === -1)
            return;
          this.$store.commit('upload/SET_UPLOAD_GRADE_LEVEL', this.gradeLevel[this.selLevelIdx]);
          break;
        case 6:
          this.$v.skill.$touch();
          if (this.$v.skill.$invalid)
            return;
          this.$store.commit('upload/SET_UPLOAD_SKILL', this.skill);
          break;
        case 7:
          this.$v.standard.$touch();
          if (this.$v.standard.$invalid)
            return;
          this.$store.commit('upload/SET_UPLOAD_STANDARD', this.standard);
          break;
        case 8:
          this.$v.readingLevel.$touch();
          if (this.$v.readingLevel.$invalid)
            return;
          this.$store.commit('upload/SET_UPLOAD_READING_LEVEL', this.readingLevel);
          break;
        case 9:
          this.$v.keywords.$touch();
          if (this.$v.keywords.$invalid)
            return;
          this.$store.commit('upload/SET_UPLOAD_KEYWORDS', this.keywords);
          break;
        case 10:
          this.$v.uploadedFiles.$touch();
          if (this.$v.uploadedFiles.$invalid)
            return;
          break;
        case 11:
          this.$v.coverImages.$touch();
          if (this.$v.coverImages.$invalid)
            return;
          break;
      }
      this.$store.commit("upload/GOTO_NEXT_UPLOAD_STEP");
    },
    clickGradeLevel(index) {
      for(let one of this.gradeLevel)
        one.value = 0;
      this.gradeLevel[index].value = 1;
    },
    validateGradeLevel() {
      for (let i=0; i < this.gradeLevel.length; i++){
        let one = this.gradeLevel[i];
        if(one.value)
          return i;
      }
      return -1;
    },
    /**Upload Files Step**/
    changeSelectFile() {
      let file = this.$refs.file.files;
      if(!file)
        return;
      if(!this.validationFile(file[0]))
        return;
      this.$store.dispatch('upload/uploadFile', file[0]);
    },
    delUploadedFile(index) {
      this.$store.dispatch('upload/delUploadedFile', this.file.displayIndex+index);
    },
    updateDisplayIndex(direction) {
      direction > 0 ? this.file.displayIndex-- : this.file.displayIndex++;
      if(this.file.displayIndex < 0)
        this.file.displayIndex = 0;
      else if (this.file.displayIndex + 2 > this.uploadedFiles.length)
        this.file.displayIndex = this.uploadedFiles.length - 2;
    },
    /**Upload Cover Images Step**/
    async changeSelectCoverImageFile() {
      let file = this.$refs.imageFile.files;
      if(!file)
        return;
    if(!this.validationFile(file[0]))
        return;
      await this.$store.dispatch('upload/uploadCoverImage', file[0]);
    },
    updateCoverImageDisplayIndex(direction) {
      direction > 0 ? this.coverImage.displayIndex-- : this.coverImage.displayIndex++;
      if (this.coverImage.displayIndex < 0)
        this.coverImage.displayIndex = 0;
      else if (this.coverImage.displayIndex + 3 > this.coverImages.length)
        this.coverImage.displayIndex = this.coverImages.length - 3;
    },
    delUploadedCoverImage(index) {
      this.$store.dispatch('upload/delUploadedCoverImage', this.coverImage.displayIndex + index);
    },
    selectPreviewCoverImage (index) {
      if (this.coverImage.displayIndex + index === this.selCoverIdx)
        return;
      this.$store.commit('upload/SET_PREVIEW_COVER_IMAGE', this.coverImage.displayIndex + index);
    },
    deleteResource() {
      this.$store.commit('upload/SET_UPLOAD_PREVIOUS_STEP', this.step);
      this.$store.commit('upload/SET_UPLOAD_STEP', 13);
    },
    validationFile(file) {
        if(`api/files/${file.name}`.length > 45){
            alert("File name is too long...");
            return false;
        }
        return true;
    }
  },
  watch : {
    uploadedFiles : function (newVal, oldVal) {
      let len = this.uploadedFiles.length;
      this.file.displayIndex = len < 2 ? 0 : len - 2;
    },
    coverImages : function (newVal, oldVal) {
      let len = this.coverImages.length;
      this.coverImage.displayIndex = len < 3 ? 0 : len - 3;
    }
  }
}
</script>
<style scoped>
.step-container {
  padding : 40px;
}
.step-body {
  height : 310px;
  display : flex;
  justify-content: space-between;
}
.description-text {
  width : 404px;
  height : 152px;
  border : 4px solid var(--col-text-form-border);
  border-radius : 5px;
  font-family : 'Nunito', sans-serif;
  font-size : 16px;
  font-weight : 600;
  color : var(--col-text-form-color);
  text-indent: 15px;
  margin : 15px 0px;
  resize : none;
}
.form-container {
  width : 410px;
  height : 106px;
  margin : 15px 0px;
}
.grade-level-btn {
  cursor : pointer;
  width : 48px;
  height : 48px;
  text-align : center;
  margin : 5px;
  border : 4px solid var(--col-text-form-border);
  border-radius : 5px;
  font-family : 'Nunito', sans-serif;
  font-size : 16px;
  font-weight : 900;
  color : var(--grade-level-btn);
}
.grade-level-btn.selected {
  color : var(--grade-level-btn-selected);
  border-color : var(--grade-level-btn-selected);
}
.files-container {
  width : 410px;
  margin : 15px 0px;
  display : flex;
  align-items : center;
}
.upload-btn {
  font: 900 16px "Nunito", "Sans Serif";
  color: var(--upload-btn-color);
  border: 4px dashed var(--upload-btn-border-color);
  width: 404px;
  height: 48px;
  text-align: left;
  padding-left: 17px;
  background: transparent;
  cursor : pointer;
}
.file-item {
  cursor : default;
  padding : 0px 17px;
  margin-bottom : 10px;
  width : 404px;
  height : 48px;
  border-radius : 8px;
  display : flex;
  align-items : center;
  color : var(--col-title-span);
}
.files-container .uploading {
  border : 4px solid var(--col-filename-text);
}
.files-container .uploaded {
  border : 4px solid var(--col-title-span);
}
.filename-text {
  font: 900 16px "Nunito", "Sans Serif";
}
.status-text {
  font: 900 14px "Nunito", "Sans Serif";
  color : var(--col-status-text);
  opacity : .5;
}
.divider {
  font: 900 14px "Nunito", "Sans Serif";
  margin : 0px 20px;
}
.del-file-btn {
  cursor : pointer;
  font-weight : 900;
  margin-left : auto;
  border-radius : 50%;
  border-color : var(--del-file-btn-background);
  background : var(--del-file-btn-background);
  color : var(--del-file-btn-color);
  opacity : .5;
}
.del-file-btn:hover {
  opacity : 1;
}
.arrow-btn {
  width : 40px;
  height : 40px;
  border-radius : 5px;
  border-color : var(--arrow-btn);
  margin : 5px 10px;
}
.arrow-up-btn {
  background: var(--arrow-btn) url("/icons/arrow_up.svg") no-repeat center;
}
.arrow-down-btn {
  background: var(--arrow-btn) url("/icons/arrow_down.svg") no-repeat center;
}
.disabled {
  background-color : var(--arrow-btn-disabled) !important;
  border-color : var(--arrow-btn-disabled) !important;
}

.coverImage-container {
  width : 410px;
  margin : 15px 0px;
  display : flex;
  align-items : center;
}
.coverImage-item-list {
  display : flex;
}
.coverImage-item {
  position : relative;
  width : 128px;
  height : 164px;
  margin-left : 10px;
  border : 2px solid var(--col-coverImage-item-color);
  box-shadow: -4px 4px var(--col-coverImage-item-color);
}
.coverImage-item:hover {
  border : 4px solid var(--col-coverImage-item-hover);
}
.coverImage-item.preview {
  opacity : .3;
}
.coverImage-item img {
  width : 100%;
  height : 100%;
}
.del-coverImage-btn {
  position : absolute;
  top : 0px;
  right : 0px;
  cursor : pointer;
  font-weight : 900;
  border-radius : 50%;
  border-color : var(--del-file-btn-background);
  background : var(--del-file-btn-background);
  color : var(--del-file-btn-color);
  opacity : .5;
}
.del-coverImage-btn:hover {
  opacity : 1;
}
</style>
