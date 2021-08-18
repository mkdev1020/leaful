<template>
    <div v-if="step === 13" class="step-container">
        <div class="title">
            <span>Permanently Delete This Resource Listing?</span>
        </div>
        <div class="step-body">
            <div>
                <div class="sub-title">
                    <span>{{title}}</span>
                </div>
                <div class="hint-text">
                    <span>
                        Warning: This action will irrevocably delete this entire
                         resource listing, and its data, from Learningful forever.
                         It cannot be undone. Please proceed cautiously.
                    </span>
                </div>
            </div>
        </div>
        <div class="control-div">
            <span></span>
            <div>
                <button class="next-step-btn" @click="cancelDeleteResource()">Cancel</button>
                <button class="next-step-btn" @click="clickDeleteButton()">Delete</button>
            </div>
        </div>
    </div>
    <div v-else class="deletion-container">
        <span>Deleting Successful</span>
    </div>
</template>
<script>
import { mapGetters } from "vuex";
import { validationMixin } from "vuelidate";
import { required, minLength, maxLength } from "vuelidate/lib/validators";

export default {
    mixins : [validationMixin],
    data(){
        return {

        }
    },
    validations : {
    },
    computed : {
        ...mapGetters({
            step : "upload/getUploadStep",
            title : "upload/getUploadTitle",
            prevStep : "upload/getPreviousStep"
        })
    },
    methods : {
        clickDeleteButton(){
            this.$store.dispatch('upload/deleteResource');
        },
        cancelDeleteResource(){
            this.$store.commit('upload/SET_UPLOAD_STEP', this.prevStep);
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
.title span {
    color : var(--col-title-delete-color);
}
.deletion-container {
    font : 900 18px "Nunito", "Sans Serif";
    color : var(--col-title-delete-color);
    width : 100%;
    height : 100%;
    display : flex;
    align-items : center;
    justify-content: center;
}
</style>
