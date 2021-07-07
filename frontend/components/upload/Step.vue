<template>
    <div class="step-container">
        <div class="title">New Resource: <span>Step {{step}}</span></div>
        <div class="step-body">
            <div v-if="step === 1">
                <div class="sub-title">Give it a catchy title.</div>
                <input class="text-form" type="text" placeholder="Title" v-model="title"/>
                <div class="error-text"><div v-if="$v.title.$error && !$v.title.required">Field is required</div></div>
                <div class="hint-text">
                    Ideally, the title of your resource should also be present on your cover 
                    image. Keep it short and sweet.
                    <br><br>
                    40 characters max.
                </div>
            </div>
            <div v-if="step === 2">
                <div class="sub-title">Add a subtitle that categorizes it.</div>
                <input class="text-form" type="text" placeholder="Resource Type" v-model="type"/>
                <div class="error-text"><div v-if="$v.type.$error && !$v.type.required">Field is required</div></div>
                <div class="hint-text">
                    In 2 or 3 words identify what this resource is. Answer this question:
                    "This resource is a/an________________."
                    <br><br>
                    25 characters max.
                </div>
            </div>
            <Preview />
        </div>
        <div class="control-div">
            <div>
                Uploading: <b v-if="title === ''">Untitled Resource</b>
                           <b v-if="title !== ''">{{this.title}}</b>
            </div>
            <div>
                <button class="next-step-btn" @click="nextStep()">Next</button>
            </div>
        </div>
    </div>
</template>
<script>
import { mapGetters } from "vuex";
import { validationMixin } from "vuelidate";
import { required, minLength } from "vuelidate/lib/validators";

import Preview from "./Preview";

export default {
    mixins : [validationMixin],
    components : {
        Preview
    },
    data(){
        return {
            title : '',
            type : ''
        }
    },
    validations : {
        title : {
            required
        },
        type : {
            required
        }
    },
    computed : {
        ...mapGetters({
            step : "upload/getUploadStep"
        })
    },
    methods : {
        nextStep(){
            switch(this.step){
                case 1:
                    this.$v.title.$touch();
                    if(this.$v.title.$invalid)
                        return;
                    this.$store.commit('upload/SET_UPLOAD_TITLE', this.title);
                    break;
                case 2:
                    this.$v.type.$touch();
                    if(this.$v.type.$invalid)
                        return;
                    this.$store.commit('upload/SET_UPLOAD_TYPE', this.type);
                    break;
            }
            this.$store.commit("upload/GOTO_NEXT_UPLOAD_STEP");
        },
    }
}
</script>
<style scoped>
.step-container {
  padding : 40px;
}
.step-body {
    display : flex;
    justify-content: space-between;
}
</style>