<template>
  <div class="precheck-left-container">
    <div class="title">New Resource: <span>Precheck</span></div>
    <div class="sub-title">
        <span>
            Let's make sure your resource qualifies for publication on Learningful.
        </span>
    </div>

    <ul>
      <template v-for="(item, index) in precheckList">
        <li :key="`qualify-${index}`">
          <CheckBox :checked="item.value" />
          <input type="checkbox" :id="`qcheck_${index}`" v-model="item.value"/>
          <label :for="`qcheck_${index}`" class="qcheck-text">{{item.text}}</label>
        </li>
      </template>
    </ul>
    <div class="control-div">
      <span>Uploading: <b>Untitled Resource</b></span>
      <div>
        <button class="next-step-btn" @click="nextFromPrecheck()">Next</button>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import CheckBox from "../CheckBox";

export default {
    components : {
        CheckBox
    },
    data()
    {
        return {
        precheckList : [
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
        this.$store.commit("upload/SET_UPLOAD_PRECHECK_LIST", this.precheckList);
        this.$store.commit("upload/GOTO_NEXT_UPLOAD_STEP");
        },
    }
}
</script>
<style scope>

.precheck-left-container {
    padding : 40px;
}
.precheck-left-container ul {
    padding-left: 10px;
    list-style-type : none;
}
.precheck-left-container ul li {
    margin : 10px 0px;
    display : flex;
    align-items : center;
}
.qcheck-text {
    font : 400 16px "Nunito", "Sans serif";
    color : var(--col-qualify-checkbox-text);
}
</style>
