<template>
  <modal
    style="z-index: 100;"
    :class="{
      showing: showModal
    }"
    @click="close"
    v-if="showModal"
  >
    <div v-if="step==-1" class="upload-cotainer">
      <div class="get-started-left-container">
        <div>
            <div>Publish It</div>
            <div>
                Learningful invites all users to upload, publish, and earn income from,
                the original teaching materials they've created. If you have something special
                 you think will help teachers, get started uploading your resource today!
            </div>
            <button @click="getStarted()">Get Started</button>
        </div>
      </div>

      <div class="get-started-right-container">
          <img :src="starterImage" width="100%"/>
      </div>
    </div>
    <div v-else-if="step>=0" class="upload-cotainer">
      <Precheck v-if="step==0"/>
      <div class="upload-right-container">
          <ul>
            <li v-for="(item, index) in stepList"
             :key="item"
             :class="{passed : (index+1)<step }">
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

export default {
  mixins: [validationMixin],
  components: {
    Modal,
    Precheck
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

<style scoped>
.upload-cotainer {
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

.upload-right-container{
    width : 250px;
    height : 458px;
    background: #cdcdcd;
}
.upload-right-container ul{
  margin-top : 40px;
  list-style-type : none;
  width : 80%;
}
.upload-right-container ul li{
  font-size : 14px;
  background : #8890a7;
  margin : 5px;
  padding : 5px;
  color : #b5c1ce;
  border-radius : 3px;
}
</style>
