<template>
    <div class="precheck-left-container">
        <h3>New Resource: <b style="color:#14d2fe">Precheck</b></h3>
        <div>Let's make sure your resource qualifies for publication on Learningful.</div>
        <ul>
            <li>
                <input type="checkbox" id="qualify-1" v-model="precheck_list[0]"/>
                <label for="qualify-1">
                    I created this resource myself, 
                    or have a legal right/license to publish its content, 
                    and it is something that will be helpful to teachers.
                </label>
            </li>
            <li>
                <input type="checkbox" id="qualify-2" v-model="precheck_list[1]"/>
                <label for="qualify-2">
                    The cover image for this resource is visibly unique, attractive to the point
                    it appears to be a professional publication, and contains the text of its title.
                </label>
            </li>
            <li>
                <input type="checkbox" id="qualify-3" v-model="precheck_list[2]"/>
                <label for="qualify-3">
                    Although my resource may consist of virtually any type of file or media, it also
                    includes at least one document of instructions that explain how to use it.
                </label>
            </li>
            <li>
                <input type="checkbox" id="qualify-4" v-model="precheck_list[3]"/>
                <label for="qualify-4">
                    This resource is not currently published elsewhere on the internet, nor do I intend
                    for it to be in the future, and is therefore wholly unique to Learningful.
                </label>
            </li>
            <li>
                <input type="checkbox" id="qualify-5" v-model="precheck_list[4]"/>
                <label for="qualify-5">
                    My resource contains no advertising, links, or information intended to promote a 
                    commercial product or service of which I am affiliated.
                </label>
            </li>
        </ul>
        <div class="control-div">
            <div>Uploading: Untitled Resource</div>
            <div>
                <button @click="nextFromPrecheck()">Next</button>
            </div>
        </div>
    </div>
</template>
<script>
import { mapGetters } from "vuex";

export default {
    data(){
        return {
            precheck_list : [0, 0, 0, 0, 0]
        }
    },
    computed : {
        ...mapGetters({
            step : "upload/getUploadStep"
        })
    },
    methods : {
        nextFromPrecheck(){
            //.... logical part...
            this.$sotre.commit("upload/SET_UPLOAD_PRECHECK_LIST", this.precheck_list);
            this.$store.commit("upload/GOTO_NEXT_UPLOAD_STEP");
        },
    }
}
</script>
<style scoped>
.precheck-left-container{
    width : 756px;
    height : 458px;
    padding : 30px;
}
.precheck-left-container ul{
  list-style-type : none;
}
.control-div{
  display : flex;
  justify-content: space-between;
  color : #c1cbdb;
  margin-top : 30px;
}
</style>