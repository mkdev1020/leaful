<template>
  <div class="step-container">
    <div :class="['title', (status === 1 ? 'active' : '')]">
      Current Status:
      <span v-if="!isAdmin">{{ dataStatus.statusText }}</span>
      <span v-else>Inactive</span>
    </div>
    <div class="step-body">
      <div v-if="!isAdmin">
        <div class="sub-title">
          <span>{{ dataStatus.subTitle }}</span>
        </div>
        <div class="hint-text">
          <span>{{ dataStatus.description }}</span>
        </div>
      </div>
      <div v-else>
        <div class="sub-title">
          <span>Review and publish.</span>
        </div>
        <div class="form-container">
          <div class="form-group">
            <input class="text-form sm-text" type="text" placeholder="Rating" v-model="rating"/>
            <input class="text-form lg-text" type="text" placeholder="Background Color Restrictions" v-model="colorRestriction"/>
          </div>
          <div class="profile-container">
            <div v-for="index in (page === 1 ? (records + 1) : records)"
                 :key="`profile_${index}`"
                 class="profile-item">
              <!-- <img v-if="(baseIndex + index) < xxx.length" :src="xxx[baseIndex + index]" /> -->
            </div>
            <button v-if="page > 1" class="arrow-btn arrow-up-btn" @click="clickArrowBtn(-1)"></button>
            <button
              :class="['arrow-btn', 'arrow-down-btn', (page === totalPage ? 'disabled' : '')]"
              @click="clickArrowBtn(1)"
            >
            </button>
          </div>
        </div>
      </div>
      <Preview :src="coverImages[selCoverIdx]" />
    </div>
    <div class="control-div">
            <span>
                <span>Uploading: </span>
                <b>{{this.title}}</b>
                <span>l <a class="del-link" @click="deleteResource()">Delete</a></span>
            </span>
      <div>
        <template v-if="!isAdmin">
          <button :class="['next-step-btn', multiButtonStatus.class]" @click="clickMultiButton()">
            {{ multiButtonStatus.text }}
          </button>
        </template>
        <template v-else>
          <button class="next-step-btn" @click="clickPublishBtn()">Publish</button>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import { validationMixin } from "vuelidate";
import { statusData, totalPages, multiButton } from "~/lib/consts";
import Preview from "./Preview";

export default {
  mixins : [validationMixin],
  components : {
    Preview
  },
  data(){
    return {
      statusData ,
      multiButton,
      rating : '',
      colorRestriction : '',
      records : 38,
      page : 1,
      totalPages,
    }
  },
  validations : {
  },
  computed : {
    ...mapGetters({
      user : "main/getUser",
      step : "upload/getUploadStep",
      title : "upload/getUploadTitle",
      coverImages : "upload/getCoverImageList",
      status : "upload/getStatus",
      prevStep : "upload/getPreviousStep"
    }),
    selCoverIdx() {
      for (let i = 0; i < this.coverImages.length; i++) {
        if (this.coverImages[i].status === 2)
          return i;
      }
      return -1;
    },
    isAdmin() {
      return this.$store.state.main.requestLimit.isAdmin;
    },
    totalPage() {
      let totalCount = 39;
      let totalPage = 1;
      while (totalCount < this.totalPages.length) {
        totalCount += 38;
        totalPage++;
      }
      return totalPage;
    },
    baseIndex() {
      return this.page === 1 ? 0 : 39 + (this.page - 2) * 38
    },
    dataStatus() {
      return this.statusData[this.status]
    },
    multiButtonStatus() {
      return this.multiButton[this.status]
    }
  },
  methods : {
    clickMultiButton() {
      if (this.status === 3 || this.status === 4) // In the case of Not Approved, Incomplete
        return;
      switch (this.status) {
        case 0:
          this.$store.dispatch('upload/submitResource', this.user.userId);
          break;
        case 1:
          this.$store.dispatch('upload/cancelSubmitResource');
          break;
        case 2:
          this.$store.dispatch('upload/deactivateResource');
          break;
        case 5:
          this.$store.commit('upload/SET_STATUS', 2);
          break;
      }
    },
    deleteResource() {
      this.$store.commit('upload/SET_UPLOAD_PREVIOUS_STEP', this.step);
      this.$store.commit('upload/SET_UPLOAD_STEP', 13);
    },
    clickArrowBtn(direction) {
      if (direction > 0) { // when click arrow-down Button
        if (this.page === this.totalPage)
          return;
        this.page++;
      }
      else {             // when click arrow-up Button
        this.page--;
      }
    },
    clickPublishBtn() {
    }
  },
  watch : {
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
.title span {
  color : var(--col-title-inactive-color);
}
.title.active span {
  color : var(--col-title-active-color);
}
.next-step-btn.disabled {
  opacity : .4;
}
.form-container {
  width : 450px;
  margin : 5px;
}
.form-group {
  display : flex;
  margin-left : 5px;
}
.sm-text {
  width : 76px;
  text-indent: 0px;
  text-align: center;
}
.lg-text {
  width : 296px;
}
.profile-container {
  display : flex;
  flex-wrap : wrap;
  align-items : center;
}
.profile-item {
  width : 32px;
  height : 32px;
  margin : 5px;
  border : 3px solid var(--col-profile-item-color);
  border-radius : 3px;
}
.arrow-btn {
  width : 32px;
  height : 32px;
  margin : 5px;
  border : 3px solid var(--status-arrow-btn);
  border-radius : 3px;
  filter : invert(1);
  cursor : pointer;
}
.arrow-btn:hover {
  background-color : var(--status-arrow-btn-hover);
  border-color : var(--status-arrow-btn-hover);
}
.arrow-up-btn {
  background : var(--status-arrow-btn) url("/icons/black-up-arrow.svg") no-repeat center;
}
.arrow-down-btn {
  background : var(--status-arrow-btn) url("/icons/black-down-arrow.svg") no-repeat center;
}
.arrow-down-btn.disabled {
  cursor : default;
}
.arrow-down-btn.disabled:hover {
  background-color : var(--status-arrow-btn);
  border-color : var(--status-arrow-btn);
}
</style>
