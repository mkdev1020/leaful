<template>
    <div class="step-container">
        <div v-if="status < 7"
             :class="['title', (status === 1 ? 'active' : (status === 6 ? 'deleting' : ''))]">
            Crrent Status: <span>{{statusText[status]}}</span>
        </div>
        <div class="step-body">
            <div v-if="status === 0">
                <div class="sub-title"><span>Get it approved.</span></div>
                <div class="hint-text">
                    <span>
                        Please inspect a live preview for this listing, by clicking the image to your right,
                         to double check the information and files you've provided. Then, when ready, submit
                         it for review.
                    </span>
                </div>
            </div>
            <div v-if="status === 1">
                <div class="sub-title"><span>Give it a catchy title.</span></div>
                <input class="text-form lg-text" type="text" placeholder="Title" v-model="title"/>
                <div class="error-text">
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
            <Preview :src="selCoverIdx === -1 ? '' : coverImages[selCoverIdx]" />
        </div>
        <div class="control-div">
            <span>
                <span>Uploading: </span>
                <b v-if="title === ''">Untitled Resource</b>
                <b v-else>{{this.title}}</b>
                <span v-if="step > 1">l <a class="del-link" onclick="">Delete</a></span>
            </span>
            <div>
                <button v-if="status === 6" class="next-step-btn" @click="cancelOperation()">Cancel</button>
                <button :class="['next-step-btn', multiButton[status].class]" @click="clickMultiButton()">
                    {{multiButton[status].text}}
                </button>
            </div>
        </div>
    </div>
</template>
<script>
import { mapGetters } from "vuex";
import { validationMixin } from "vuelidate";
import { required, minLength, maxLength } from "vuelidate/lib/validators";

import Preview from "./Preview";

export default {
    mixins : [validationMixin],
    components : {
        Preview
    },
    data(){
        return {
            statusText : {
                0 : "Inactive",  // before submit - in Draft
                1 : "In Review", // after submit - waiting for review
                2 : "Activate",  // approved by admin
                3 : "Inactive",  // not approved by admin - need some change and resubmit
                4 : "Incomplete",// there 's uncompleted steps
                5 : "Inactive",   // when an user manually deactivated it
                6 : "Permantely Delete This Resource Listing?", // when an user click delete link
                7 : "Deleting Successful" // when successfully deleted
            },
            multiButton : [
                { class : '', text : 'Submit'},
                { class : '', text : 'Cancel'},
                { class : '', text : 'Deactivate'},
                { class : 'disabled', text : 'Submit'},
                { class : 'disabled', text : 'Submit'},
                { class : '', text : 'Reactivate'},
                { class : '', text : 'Delete'},
            ]
        }
    },
    validations : {
    },
    computed : {
        ...mapGetters({
            step : "upload/getUploadStep",
            title : "upload/getUploadTitle",
            coverImages : "upload/getCoverImageList",
            status : "upload/getStatus",
            prevStatus : "upload/getPreviousStatus",
            prevStep : "upload/getPreviousStep"
        }),
        selCoverIdx(){
            for(let i=0; i<this.coverImages.length; i++){
                if(this.coverImages[i].status === 2)
                    return i;
            }
            return -1;
        }
    },
    methods : {
        nextStep(){
            switch(this.step){
                case 11:
                    this.$v.coverImages.$touch();
                    if(this.$v.coverImages.$invalid)
                        return;
                    break;
            }
            this.$store.commit("upload/GOTO_NEXT_UPLOAD_STEP");
        },
        clickMultiButton(){
            if(this.status === 3 || this.status === 4) // In the case of Not Approved, Incomplete
                return;
            switch(this.status){
                case 0:
                    this.$store.dispatch('upload/submitResource');
                    break;
                case 1:
                    this.cancelSubmitResource();
                    break;
                case 2:
                    this.$store.commit('upload/SET_STATUS', 5);
                    break;
                case 5:
                    this.$store.commit('upload/SET_STATUS', 1);
                    break;
                case 6:
                    this.$store.dispatch('upload/deleteResource');
                    break;
            }
        },
        cancelSubmitResource(){
            this.$store.commit('upload/SET_STATUS', 0);
        },
        deleteResource(){
            this.$store.commit('upload/SET_PREVIOUS_STATUS', this.status);
            this.$store.commit('upload/SET_STATUS', 6);
        },
        cancelDeleteResource(){
            this.$store.commit('upload/SET_STATUS', this.prevStatus);
            this.$store.commit('upload/SET_UPLOAD_STEP', this.prevStep);
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
.title.active {
    color : var(--col-title-active-color);
}
.title.deleting {
    color : var(--col-title-delete-color);
}
.next-step-btn.disabled {
    opacity : .4;
}
</style>