<template>
  <div class="precheck-left-container">
    <div class="title">New Resource: <span>Precheck</span></div>
    <div class="sub-title">Let's make sure your resource qualifies for publication on Learningful.</div>

    <ul>
      <template v-for="(item, index) in precheck_list">
        <li :key="`qualify-${index}`">
          <input type="checkbox" :id="`qualify-${index}`" v-model="item.value"/>
          <label :for="`qualify-${index}`">
            {{item.text}}
          </label>
        </li>
      </template>
    </ul>

    <div class="control-div">
      <div>Uploading: <b>Untitled Resource</b></div>
      <div>
        <button class="next-step-btn" @click="nextFromPrecheck()">Next</button>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";

export default {
  data()
  {
    return {
      precheck_list : [
        {
          value: 0,
          text: 'I created this resource myself, \n' +
            '                    or have a legal right/license to publish its content, \n' +
            '                    and it is something that will be helpful to teachers.'
        },
        {value: 0, text: 'The cover image for this resource is visibly unique, attractive to the point\n' +
            '                    it appears to be a professional publication, and contains the text of its title.'},
        {value: 0, text: 'Although my resource may consist of virtually any type of file or media, it also\n' +
            '                    includes at least one document of instructions that explain how to use it.'},
        {value: 0, text: 'This resource is not currently published elsewhere on the internet, nor do I intend\n' +
            '                    for it to be in the future, and is therefore wholly unique to Learningful.'},
        {value: 0, text: 'My resource contains no advertising, links, or information intended to promote a \n' +
            '                    commercial product or service of which I am affiliated.'}
      ]
    }
  },

  computed : {
    ...mapGetters({
      step : "upload/getUploadStep"
    })
  },
  methods : {
    nextFromPrecheck()
    {
      //.... logical part...
      this.$store.commit("upload/SET_UPLOAD_PRECHECK_LIST", this.precheck_list);
      this.$store.commit("upload/GOTO_NEXT_UPLOAD_STEP");
    },
  }
}
</script>
<style scoped>
.precheck-left-container{
  padding : 40px;
}
.precheck-left-container ul{
  list-style-type : none;
}

</style>
