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
    <div v-else-if="step==0" class="upload-cotainer">
      <div class="precheck-left-container">
        <h3>New Resource: <b>Precheck</b></h3>
        <div>Let's make sure your resource qualifies for publication on Learningful.</div>
        <ul>
            <li>
                <input type="checkbox" id="qualify-1" @click="selectQualify(1)"/>
                <label for="qualify-1">
                    I created this resource myself, 
                    or have a legal right/license to publish its content, 
                    and it is something that will be helpful to teachers.
                </label>
            </li>
            <li>
                <input type="checkbox" id="qualify-2" @click="selectQualify(2)"/>
                <label for="qualify-2">
                    The cover image for this resource is visibly unique, attractive to the point
                    it appears to be a professional publication, and contains the text of its title.
                </label>
            </li>
            <li>
                <input type="checkbox" id="qualify-3" @click="selectQualify(3)"/>
                <label for="qualify-3">
                    Although my resource may consist of virtually any type of file or media, it also
                    includes at least one document of instructions that explain how to use it.
                </label>
            </li>
            <li>
                <input type="checkbox" id="qualify-4" @click="selectQualify(4)"/>
                <label for="qualify-4">
                    This resource is not currently published elsewhere on the internet, nor do I intend
                    for it to be in the future, and is therefore wholly unique to Learningful.
                </label>
            </li>
            <li>
                <input type="checkbox" id="qualify-5" @click="selectQualify(5)"/>
                <label for="qualify-5">
                    My resource contains no advertising, links, or information intended to promote a 
                    commercial product or service of which I am affiliated.
                </label>
            </li>
        </ul>
        <div>
            <div>Uploading: Untitled Resource</div>
            <div>
                <button @click="next()">Next</button>
            </div>
        </div>
      </div>

      <div class="precheck-right-container">
          
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

export default {
  mixins: [validationMixin],
  components: {
    Modal
  },

  data() {
    return {
        starterImage : starterImage,
        step : -1
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
      showModal: "upload/getUploadModalStatus"
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
        this.step+=1;
    },
    next(){
        //.... logical part...
        this.step+=1;
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
.precheck-left-container{
    width : 756px;
    height : 458px;
}
.precheck-right-container{
    width : 250px;
    height : 458px;
    background: #cdcdcd;
}

</style>
