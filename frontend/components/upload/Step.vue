<template>
    <div class="step-container">
        <div class="title">New Resource: <span>Step {{step}}</span></div>
        <div class="step-body">
            <div v-if="step === 1">
                <div class="sub-title"><span>Give it a catchy title.</span></div>
                <input class="text-form lg-text" type="text" placeholder="Title" v-model="title"/>
                <div class="error-text">
                    <template v-if="$v.title.$error">
                        <span v-if="!$v.title.required">Field is required</span>
                        <span v-if="!$v.title.maxLength">Name must have at most {{$v.title.$params.maxLength.max}} letters.</span>
                    </template>
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
            <div v-if="step === 2">
                <div class="sub-title"><span>Add a subtitle that categorizes it.</span></div>
                <input class="text-form lg-text" type="text" placeholder="Resource Type" v-model="type"/>
                <div class="error-text">
                    <template v-if="$v.type.$error">
                        <span v-if="!$v.type.required">Field is required</span>
                        <span v-if="!$v.type.maxLength">Resource Type must have at most {{$v.type.$params.maxLength.max}} letters.</span>
                    </template>
                </div>
                <div class="hint-text">
                    <span>
                        In 2 or 3 words identify what this resource is. Answer this question:
                        "This resource is a/an________________."
                        <br><br>
                        25 characters max.
                    </span>
                </div>
            </div>
            <div v-if="step === 3">
                <div class="sub-title"><span>Academic subject area?</span></div>
                <input class="text-form lg-text" type="text" placeholder="Subject Area" v-model="subject"/>
                <div class="error-text">
                    <template v-if="$v.subject.$error">
                        <span v-if="!$v.subject.required">Field is required</span>
                        <span v-if="!$v.subject.maxLength">Resource Type must have at most {{$v.subject.$params.maxLength.max}} letters.</span>
                    </template>
                </div>
                <div class="hint-text">
                    <span>
                        This will display on the banner for the listing. If no subject
                        directly applies, choose a descriptive term.
                        <br><br>
                        15 characters max.
                    </span>
                </div>
            </div>
            <div v-if="step === 4">
                <div class="sub-title"><span>Describe it in detail.</span></div>
                <textarea class="description-text" placeholder="Description" v-model="description"/>
                <div class="error-text">
                    <template v-if="$v.description.$error">
                        <span v-if="!$v.description.required">Field is required</span>
                        <span v-if="!$v.description.minLength">Resource Type must have at least {{$v.description.$params.minLength.min}} letters.</span>
                        <span v-if="!$v.description.maxLength">Resource Type must have at most {{$v.description.$params.maxLength.max}} letters.</span>
                    </template>
                </div>
                <div class="hint-text">
                    <span>
                        Explain what this resource is and elaborate on how these materials minLength
                        ultimately be useful to teachers.
                        <br><br>
                        100 characters min, 1000 max.
                    </span>
                </div>
            </div>
            <div v-if="step === 5">
                <div class="sub-title"><span>Ideal grade level.</span></div>
                <div class="form-container">
                    <template v-for="(item, index) in grade_level">
                        <button :class="{'grade-level-btn' : 1, 'selected' : item.value}"
                                :key="'grade_'+index"
                                @click="clickGradeLevel(index)">
                                    {{item.text}}
                        </button>
                    </template>
                </div>
                <div class="error-text">
                    <span v-if="sel_level_idx === -1">You must select at least one Grade Level.</span>
                </div>
                <div class="hint-text">
                    <span>
                        Select 1 grade level that you feel is the most ideal fit for this resource, even if 
                        it can be used at multiple levels.
                    </span>
                </div>
            </div>
            <div v-if="step === 6">
                <div class="sub-title"><span>Skills (Optional)</span></div>
                <div class="form-container">
                   <input v-for="(item, index) in skill"
                        :key="'skill_'+index"
                        class="text-form md-text" type="text"
                        :placeholder="'Skill '+(index+1)"
                        v-model="item.value"/>
                </div>
                <div class="error-text">
                    <span v-if="$v.skill.$error">Skill must have at most {{$v.skill.$each[0].value.$params.maxLength.max}} letters.</span>
                </div>
                <div class="hint-text">
                    <span>
                        Enter up to 4 academic or life skill bases that this resource
                        may help teachers address with their students.
                        <br><br>
                        20 characters max.
                    </span>
                </div>
            </div>
            <Preview />
        </div>
        <div class="control-div">
            <span>
                <span>Uploading: </span>
                <b v-if="title === ''">Untitled Resource</b>
                <b v-if="title !== ''">{{this.title}}</b>
                <span v-if="step > 1">l <a class="del-link" onclick="">Delete</a></span>
            </span>
            <div>
                <button class="next-step-btn" @click="nextStep()">Next</button>
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
            title : '',
            type : '',
            subject : '',
            description : '',
            grade_level : [
                { value : 0, text : 'P' },
                { value : 0, text : 'K' },
                { value : 0, text : '1' },
                { value : 0, text : '2' },
                { value : 0, text : '3' },
                { value : 0, text : '4' },
                { value : 0, text : '5' },
                { value : 0, text : '6' },
                { value : 0, text : '7' },
                { value : 0, text : '8' },
                { value : 0, text : '9' },
                { value : 0, text : '10' },
                { value : 0, text : '11' },
                { value : 0, text : '12' }
            ],
            sel_level_idx : 0,
            skill : [
                        { value : '' },
                        { value : '' },
                        { value : '' },
                        { value : '' }
            ]
        }
    },
    validations : {
        title : {
            required,
            maxLength : maxLength(40)
        },
        type : {
            required,
            maxLength : maxLength(25)
        },
        subject : {
            required,
            maxLength : maxLength(15)
        },
        description : {
            required,
            minLength : minLength(100),
            maxLength : maxLength(1000)
        },
        skill : {
            $each : {
                value : {
                    maxLength : maxLength(20)
                }
            }
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
                case 3:
                    this.$v.subject.$touch();
                    if(this.$v.subject.$invalid)
                        return;
                    this.$store.commit('upload/SET_UPLOAD_SUBJECT', this.subject);
                    break;
                case 4:
                    this.$v.description.$touch();
                    if(this.$v.description.$invalid)
                        return;
                    this.$store.commit('upload/SET_UPLOAD_DESCRIPTION', this.description);
                    break;
                case 5:
                    this.sel_level_idx = this.validateGradeLevel();
                    if(this.sel_level_idx === -1)
                        return;
                    this.$store.commit('upload/SET_UPLOAD_GRADE_LEVEL', this.grade_level[this.sel_level_idx]);
                    break;
                case 6:
                    this.$v.skill.$touch();
                    if(this.$v.skill.$invalid)
                        return;
                    this.$store.commit('upload/SET_UPLOAD_SKILL', this.skill);
                    break;
            }
            this.$store.commit("upload/GOTO_NEXT_UPLOAD_STEP");
        },
        clickGradeLevel(index){
            for(let one of this.grade_level)
                one.value = 0;
            this.grade_level[index].value = 1;
        },
        validateGradeLevel(){
            for(let i=0; i<this.grade_level.length; i++){
                let one = this.grade_level[i];
                if(one.value)
                    return i;
            }
            return -1;
        }
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
.description-text {
    width : 404px;
    height : 152px;
    border : 4px solid var(--col-text-form-border);
    border-radius : 5px;
    font-family : 'Nunito', sans-serif;
    font-size : 16px;
    font-weight : 600;
    color : var(--col-text-form-color);
    text-indent: 15px;
    margin : 15px 0px;
    resize : none;
}
.form-container {
    width : 410px;
    height : 106px;
    margin : 15px 0px;
}
.grade-level-btn {
    cursor : pointer;
    width : 48px;
    height : 48px;
    text-align : center;
    margin : 5px;
    border : 4px solid var(--col-text-form-border);
    border-radius : 5px;
    font-family : 'Nunito', sans-serif;
    font-size : 16px;
    font-weight : 900;
    color : var(--grade-level-btn);
}
.grade-level-btn.selected {
    color : var(--grade-level-btn-selected);
    border-color : var(--grade-level-btn-selected);
}
</style>