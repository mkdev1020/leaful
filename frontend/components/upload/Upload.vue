<template>
  <modal
    style="z-index: 100;"
    :class="{
      showing: showModal
    }"
    @click="close"
    v-if="showModal"
  >
    <div v-if="step === -1" class="upload-container">
      <div class="get-started-left-container">
        <div>
            <div class="upload-title">Publish It</div>
            <div class="upload-subtitle">
              <span>
                <b>Learningful</b> invites all users to upload, publish, and earn income from,
                the original teaching materials they've created. If you have something special
                 you think will help teachers, get started uploading your resource today!
              </span>
            </div>
            <button class="start-btn" @click="getStarted()">Get Started</button>
        </div>
      </div>

      <div class="get-started-right-container">
          <img :src="starterImage" width="100%"/>
      </div>
    </div>
    <div v-else-if="step >= 0" class="upload-container">
      <div class="upload-left-container">
        <Precheck v-if="step === 0" />
        <Step v-else-if="(step > 0 && step < 12)"/>
      </div>
      <div class="upload-right-container">
          <ul>
            <li v-for="(item, index) in stepList"
             :key="item"
             :class="{ focus : (index+1) === step }">
                {{item}}
            </li>
          </ul>
      </div>
    </div>
  </modal>
</template>

<script>
import { mapGetters } from "vuex";
import { validationMixin } from "vuelidate";
import { required, minLength, numeric, minValue } from "vuelidate/lib/validators";
import starterImage from "../../assets/images/upload/start.png";

import Modal from "../Modal";
import Precheck from "./Precheck";
import Step from "./Step";

export default {
  mixins: [validationMixin],
  components: {
    Modal,
    Precheck,
    Step
  },

  data() {
    return {
        starterImage : starterImage,
        stepList : [
          "Title",
          "Resource Type",
          "Subject Area",
          "Description",
          "Grade",
          "Skills",
          "Standards",
          "Reading Level",
          "Keywords",
          "Files",
          "Images",
          "Status"
        ]
    };
  },

  validations: {
    // newItem: {
    //   short_title: {
    //     required,
    //   },
    //   order_index: {
    //     required,
    //     numeric,
    //     minValue: 0,
    //   },
    // }
  },
  computed: {
    ...mapGetters({
      showModal: "upload/getUploadModalStatus",
      step : "upload/getUploadStep"
    }),
    feedbackTextCount() {
      return this.textCount - this.feedback.length
    },
    isAdmin() {
      return this.$store.state.main.isAdmin
    }
  },
  methods: {
    close() {
      this.$store.commit("upload/SET_UPLOAD_MODAL", false);
    },
    getStarted(){
        //.... logical part...
      this.$store.commit("upload/GOTO_NEXT_UPLOAD_STEP");
    }
  },

  async mounted() {
  },

  watch: {
  }
};
</script>

<style>
.upload-container {
  display: flex;
  width : 1014px;
  height : 458px;
}

.get-started-left-container {
  width: 358px;
  height: 458px;
  background: var(--col-upload-get-started-left);
  padding: 40px;
  display : flex;
  align-items : center;
}

.get-started-right-container {
  width: 656px;
  height: 458px;
}
.upload-left-container {
  width : 756px;
  height : 458px;
}
.upload-right-container {
  width : 250px;
  height : 458px;
  background: var(--col-upload-right-container);
}
.upload-right-container ul {
  margin-top : 30px;
  list-style-type : none;
  width : 85%;
}
.upload-right-container ul li {
  font : 900 14px "Nunito";
  background : var(--col-upload-right-container-ul-li-background);
  margin : 4px;
  padding : 5px;
  color : var(--col-upload-right-container-ul-li-color);
  border-radius : 3px;
}
.upload-right-container ul li.focus {
  background : var(--col-upload-right-container-ul-li-focus-background);
  color : var(--col-upload-right-container-ul-li-focus-color);
}
.upload-title {
  font-size: 36px;
  font-weight: 900;
  font-family: 'Nunito', sans-serif;
  color: var(--col-upload-title);
}

.upload-subtitle {
  font-size: 14px;
  font-weight: 400;
  font-family: 'Nunito', sans-serif;
  color: var(--col-upload-subtitle);
}

.start-btn {
  height: 40px;
  width: 134px;
  border-radius: 5px;
  border: none;
  background: var(--start-btn-background);
  color: var(--start-btn-color);
  font-family: 'Nunito', sans-serif;
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
  margin-top: 10px;
}

.start-btn:hover {
  opacity: .5;
}

/**common css**/
.title {
    font-family : 'Nunito', sans-serif;
    font-weight : 900;
    color : var(--col-title);
    font-size : 20px;
}
.title span {
  color: var(--col-title-span);
}
.sub-title {
  font : 400 16px "Nunito", sans-serif;
  color : var(--col-subtitle);
}
.control-div {
  display : flex;
  justify-content: space-between;
  font-family : 'Nunito', sans-serif;
  font-size : 16px;
  font-weight : 400;
  color : var(--col-control-div);
  margin-top : 30px;
}
.next-step-btn {
  font-family: 'Nunito', sans-serif;
  font-size : 18px;
  font-weight: 900;
  color : var(--next-step-btn);
  padding : 4px 7px;
  border : 4px solid rgb(195 205 221 / 20%);
  border-radius: 5px;
  opacity : .5;
  cursor : pointer;
}
.next-step-btn:active {
  border-color : rgb(195 205 221 / 100%);
  opacity : 1;
}

.text-form {
  height : 48px;
  border : 4px solid var(--col-text-form-border);
  border-radius : 5px;
  font-family : 'Nunito', sans-serif;
  font-size : 16px;
  font-weight : 600;
  color : var(--col-text-form-color);
  text-indent: 15px;
  margin : 5px 5px 5px 0px;
}
.text-form::placeholder {
  color : var(--col-text-form-placeholder);
}
.lg-text {
  width : 404px;
}
.md-text {
  width : 200px;
}
.hint-text {
  font : 400 14px "Nunito", sans-serif;
  width : 450px;
}
.error-text {
  font-size: 12px;
  color: var(--col-error-text);
  height: 20px;
}
.del-link {
  font-weight : 900;
  color : var(--col-del-link);
  opacity : .5;
  cursor : pointer;
}
.del-link:hover {
  opacity : 1;
}
</style>
