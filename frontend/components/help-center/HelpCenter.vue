<template>
  <modal
    style="z-index: 100;"
    :class="{
      showing: showModal
    }"
    @click="close"
    v-if="showModal"
  >
    <div class="help-center-modal-container">
      <div class="help-center-list">
        <div class="help-center-list-header">
          Terms of Service
        </div>

        <div class="help-center-list-items" v-if="showSearchList">
          <template v-for="(item, index) in searchListItems">
            <div
              :class="[
                'help-center-list-item',
                 index + 1 === itemSelected ? 'help-center-list-item-selected' : ''
                 ]"
              :key="index"
              @click="selectItem(index)"
              v-if="index + 1 > highRange && index + 1 <= lowRange"
            >
              <span>{{ index + 1 }}.</span>
              <span class="help-center-list-item-title">{{ item.short_title }}</span>
            </div>
          </template>
        </div>

        <div class="help-center-list-items" v-else>
          <div :class="['help-center-list-item']" @click="addNewItem()" v-if="!showAddNew">
            <span class="help-center-list-add-new">[ +New ]</span>
          </div>
          <template v-for="(item, index) in items">
            <div
              :class="[
                'help-center-list-item',
                 index + 1 === itemSelected ? 'help-center-list-item-selected' : ''
                 ]"
              :key="index"
              @click="selectItem(index)"
              v-if="index + 1 > highRange && index + 1 <= lowRange"
            >
              <span>{{ index + 1 }}.</span>
              <span class="help-center-list-item-title">{{ item.short_title }}</span>
            </div>
          </template>
        </div>

        <div class="help-center-control">
          <input v-model="searchText" type="text" class="input help-center-control-serach" />
          <button class="help-center-navigate-button arrow-up" @click="navigateUp()"></button>
          <button class="help-center-navigate-button arrow-down" @click="navigateDown()"></button>
        </div>
      </div>

      <div class="divider" />

      <div class="help-center-content">

        <div class="help-center-content-header">
          Help Center
        </div>

        <template v-if="showAddNew">
          <div class="add-new-item-form">
            <input
              type="text"
              placeholder="Long Title"
              name="longtext"
              v-model="newItem.long_title"
              :class="['add-new-item-long-text', $v.newItem.long_title.$invalid ? 'input-error': '']"
            >

            <textarea
              name="body"
              placeholder="text"
              cols="30"
              rows="10"
              v-model="newItem.body"
              :class="['add-new-item-body', $v.newItem.body.$invalid ? 'input-error': '']"
            >
            </textarea>

            <div class="add-new-item-group">
              <input
                type="number"
                placeholder="-"
                name="order"
                v-model="newItem.order_index"
                :class="['add-new-order', $v.newItem.order_index.$invalid ? 'input-error': '']"
              >

              <input
                type="text"
                placeholder="Short Title"
                name="shortText"
                v-model="newItem.short_title"
                :class="['add-new-short-title', $v.newItem.short_title.$invalid ? 'input-error': '']"
              >

              <input
                type="text"
                placeholder="Color"
                name="color"
                v-model="newItem.accent_color"
                class="add-new-color"
              >

              <template v-if="newItem.image_locator">
                <div class="image-locator">
                  <span>{{newItem.image_locator}}</span>
                  <div>
                    <button class="delete-image" @click="discardNewImage()"></button>
                  </div>

                </div>
              </template>

              <template v-else>
                <input type="file" name="image" id="image-add-btn" accept="image/*" ref="imageInput" hidden @change="onFileChange()">
                <label for="image-add-btn" class="add-new-image">+ Image</label>
              </template>

            </div>
          </div>

          <div class="help-center-ask">
            <span class="delete-button" @click="discardAddNew()">Delete</span>
            <button class="save-button" :disabled="!submitEnabled" @click="storeItem()">Save</button>
          </div>

        </template>

        <template v-else-if="showItemEdit">
          <div class="add-new-item-form">
            <input
              type="text"
              placeholder="Long Title"
              name="longtext"
              v-model="itemEdit.long_title"
              :class="['add-new-item-long-text', $v.newItem.long_title.$invalid ? 'input-error': '']"
            >

            <textarea
              name="body"
              placeholder="text"
              cols="30"
              rows="10"
              v-model="itemEdit.body"
              :class="['add-new-item-body', $v.newItem.body.$invalid ? 'input-error': '']"
            ></textarea>

            <div class="add-new-item-group">
              <input
                type="number"
                placeholder="-"
                name="order"
                v-model="itemEdit.order_index"
                :class="['add-new-order', $v.newItem.order_index.$invalid ? 'input-error': '']"
              >

              <input
                type="text"
                placeholder="Short Title"
                name="shortText"
                v-model="itemEdit.short_title"
                :class="['add-new-short-title', $v.newItem.short_title.$invalid ? 'input-error': '']"
              >

              <input
                type="text"
                placeholder="Color"
                name="shortText"
                v-model="itemEdit.accent_color"
                class="add-new-color"
              >

              <template v-if="itemEdit.image">
                <div class="image-locator">
                  <span>{{itemEdit.image}}</span>
                  <div>
                    <button class="delete-image" @click="discardImage()"></button>
                  </div>
                </div>
              </template>

              <template v-else>
                <input type="file" name="image" id="image-edit-btn" hidden>
                <label for="image-edit-btn" class="add-new-image"><span>+ Image</span></label>
              </template>

            </div>
          </div>

          <div class="help-center-ask">
            <template v-if="showDeleteConfirm">
              <div>
                <span class="delete-confirm-text">Delete this term?</span>
                <span class="delete-confirm-btn yes-btn" @click="deleteItem()">Yes</span> | <span class="delete-confirm-btn cancel-btn" @click="discardDeleteConfirm()">Cancel</span>
              </div>

            </template>
            <template v-else>
              <span class="delete-button" @click="showConfirmBeforeDelete()">Delete</span>
              <button class="save-button" :disabled="!submitEnabled" @click="updateItem()">Save</button>
            </template>
          </div>
        </template>

        <template v-else-if="showAskItSubmit">
          <div class="topic-title">
                <span>
                  Message Sent and Received!
                </span>
          </div>

          <div class="topic-description">
            Your message has been received by learningful.
          </div>

          <div class="feedback-form">
              <textarea
                v-model="feedback"
                name="feedback"
                cols="30"
                rows="10"
                :class="['feedback-form-area', feedbackTextCount < 100 ? 'feedback-less-count' : '']"
                placeholder="Your inquery is being reviewed."
                maxlength="425"
                disabled
              >
              </textarea>

            <div class="form-submit">
              <div class="character-left">
                <span class="character-count">{{ feedbackTextCount }}</span>
                {{ feedbackTextCount > 1 ? "Characters" : "Character" }} Left
              </div>
              <button class="submit-button" :disabled="!feedback" @click="submitFeedback()">Ask It</button>
            </div>
          </div>

        </template>

        <template v-else>
          <template v-if="items.length > 0">
            <template v-if="showSearchList">

              <div class="topic-title" v-if="!showItemEdit">
                <span >
                  {{searchListItems[itemSelected - 1]['long_title']}}
                </span>
                <span class="help-center-item-edit" v-if="isAdmin && !showItemEdit">[Edit]</span>
              </div>

              <div class="topic-description" v-if="!showItemEdit">
                {{searchListItems[itemSelected - 1]['body']}}
              </div>
            </template>

            <template v-else>

              <template v-if="!showItemEdit">
                <div class="topic-title">
                  {{items[itemSelected - 1]['long_title']}}
                  <span class="help-center-item-edit" v-if="isAdmin" @click="showEditItem()">[Edit]</span>
                </div>

                <div class="topic-description">
                  {{items[itemSelected - 1]['body']}}
                </div>
              </template>

            </template>
          </template>

          <template v-if="showAskIt">
            <div class="feedback-form">
              <textarea
                v-model="feedback"
                name="feedback"
                cols="30"
                rows="10"
                :class="['feedback-form-area', feedbackTextCount < 100 ? 'feedback-less-count' : '']"
                placeholder="Have a question you'd like answered? Type it here."
                maxlength="425"
              >
              </textarea>

              <div class="form-submit">
                <div class="character-left">
                  <span class="character-count">{{ feedbackTextCount }}</span>
                  {{ feedbackTextCount > 1 ? "Characters" : "Character" }} Left
                </div>
                <button class="submit-button" :disabled="!feedback" @click="submitFeedback()">Ask It</button>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="help-center-ask">
              <span class="ask-it-text">Have a question about this information?</span>
              <span class="ask-it-button" @click="showFeedbackForm()">Ask It Here</span>
            </div>
          </template>
        </template>

      </div>
    </div>
  </modal>
</template>

<script>
import { mapGetters } from "vuex";
import { validationMixin } from "vuelidate";
import { required, minLength, numeric, minValue } from "vuelidate/lib/validators";

import Modal from "../Modal";

export default {
  mixins: [validationMixin],
  components: {
    Modal
  },

  data() {
    return {
      file: null,
      proTip: {},
      loading: false,
      textCount: 425,
      itemSelected: 1,
      listToShow: 6,
      highRange: 0,
      lowRange: 6,
      feedback: '',
      searchText: '',
      showSearchList: false,
      searchListItems: [],
      showAskIt: false,
      showFeedbackSubmit: false,
      showAddNew: false,
      showItemEdit: false,
      showAskItSubmit: false,
      newItem: {
        id: null,
        short_title: '',
        long_title: '',
        body: '',
        image: '',
        image_locator: '',
        accent_color: '',
        order_index: null
      },
      editItem: this.itemEdit,
      showDeleteConfirm: false,
    };
  },

  validations: {
    newItem: {
      short_title: {
        required,
      },
      long_title: {
        required,
      },
      body: {
        required
      },
      order_index: {
        required,
        numeric,
        minValue: 0,
      },
    }

  },
  computed: {
    ...mapGetters({
      items: 'help-center/getHelpCenterList',
      showModal: "help-center/getHelpCenterModalStatus"
    }),
    feedbackTextCount() {
      return this.textCount - this.feedback.length
    },
    isAdmin() {
      return this.$store.state.main.isAdmin
    },
    itemEdit: {
      get() {
        const selectedItem = this.items[this.itemSelected - 1]
        let stringPos = selectedItem.image_locator ? selectedItem.image_locator.lastIndexOf('/') : ''
        let image = selectedItem.image_locator || ''
        image = image ? stringPos >= 0 ? image.substring(stringPos + 1, image.length) : '' : ''
        let item = {
          id: selectedItem.id,
          short_title: selectedItem.short_title,
          long_title: selectedItem.long_title,
          body: selectedItem.body,
          image: image,
          order_index: selectedItem.order_index,
          accent_color: selectedItem.accent_color
        }
        this.newItem = item
        return item
      },
      set (val) {
        this.newItem.short_title = val.short_title
        this.newItem.long_title = val.long_title
        this.newItem.body = val.body
        this.newItem.image = val.image
        this.newItem.order_index = val.order_index
        this.newItem.accent_color = val.accent_color
      }
    },
    submitEnabled() {
      return !this.$v.$invalid;
    },
  },
  methods: {
    close() {
      this.$store.commit("help-center/SET_HELP_CENTER_MODAL", false);
    },
    selectItem(index) {
      this.itemSelected = index + 1
      this.setRange()
    },
    navigateUp() {
      if (this.itemSelected > 1) {
        this.itemSelected--
        this.setRange()
      }
    },
    navigateDown() {
      if (this.itemSelected < this.items.length) {
        this.itemSelected++
        this.setRange()
      }
    },
    setRange() {
      this.showAskItSubmit = false
      this.showItemEdit = false
      this.showAskIt = false
      this.showAddNew = false
      let mod = this.itemSelected % 6
      if(mod) {
        this.highRange = this.itemSelected - mod
        this.lowRange = this.highRange + 6
      } else {
        this.lowRange = this.itemSelected
        this.highRange = this.lowRange - 6
      }
    },
    showFeedbackForm() {
      this.showAskIt = true
    },

    addNewItem() {
      this.showAddNew = true
      this.itemSelected = 0
    },
    showEditItem() {
      this.showItemEdit = true
    },
    discardAddNew() {
      this.showAskItSubmit = false
      this.showAddNew = false
      this.showDeleteConfirm = false
      this.showItemEdit = false
      this.itemSelected = 1
    },
    discardItemEdit() {
      this.showItemEdit = false
      this.itemSelected = 1
    },
    discardImage() {
      this.itemEdit.image = ''
    },
    showConfirmBeforeDelete() {
      this.showDeleteConfirm = true
    },
    discardDeleteConfirm() {
      this.showDeleteConfirm = false
    },
    onFileChange() {
      const file   = document.querySelector('input[type=file]').files[0];
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = e => {
        this.newItem.image = e.target.result
        this.newItem.image_locator = file.name
      }
    },
    discardNewImage() {
      this.newItem.image = ''
      this.newItem.image_locator = ''
    },

    async storeItem() {
      await this.$store.dispatch('help-center/storeItem', this.newItem)
      this.newItem = Object.assign({}, {
        short_title: '',
        long_title: '',
        body: '',
        image: '',
        image_locator: '',
        accent_color: '',
        order_index: null
      })
      this.showAddNew = false
      this.itemSelected = 1
    },
    async updateItem() {
      console.log(this.newItem)
      let item = this.newItem
      item.index = this.itemSelected - 1
      await this.$store.dispatch('help-center/updateItem', item)
    },

    async deleteItem() {
      let selectedItem = this.items[this.itemSelected - 1]
      console.log(selectedItem)
      selectedItem.index = this.itemSelected - 1
      await this.$store.dispatch('help-center/deleteItem', selectedItem)
    },
    async submitFeedback() {
      await this.$store.dispatch('help-center/submitFeedback', this.feedback)
      this.showAskItSubmit = true
      this.feedback = ''
    }
  },

  async mounted() {
    this.$store.dispatch('help-center/fetchList')
  },

  watch: {
    searchText (val) {
      if (val) {
        let searchList = this.items.filter(item => {
          let reg = new RegExp(`${val.toLowerCase()}`, "i")
          item = item.short_title.toLowerCase()
          return item.search(val) >= 0
        })
        this.searchText = val
        this.searchListItems = searchList
        this.showSearchList = true
        this.itemSelected = 1
      } else {
        this.showSearchList = false
        this.itemSelected = 1
      }
    }
  },
};
</script>

<style scoped>
.help-center-modal-container {
  display: grid;
  grid-template-columns: 350px auto auto;
  /* border-radius: 5px;
  overflow: hidden; */
}

.divider {
  width: 10px;
  height: 100%;
  background: white;
}

.help-center-list {
  width: 358px;
  height: 458px;
  background: var(--col-help-center-left);
  padding: 40px;
}

.help-center-list-header {
  font-size: 18px;
  font-family: "Nunito", sans-serif;
  font-weight: 900;
  color: #ffffff;
}

.help-center-list-items {
  font-size: 16px;
  font-family: "Nunito", sans-serif;
  font-weight: 900;
  color: var(--col-help-center-list-title);
  padding: 10px 0;
  margin-bottom: 30px;
  cursor: pointer;
  min-height: 260px;
}

.help-center-list-item {
  padding: 7px 0;
}

.help-center-list-item-title {
  text-decoration: underline;
}

.help-center-content {
  width: 656px;
  height: 458px;
  padding: 40px;
}

.help-center-content-header {
  font-weight: 900;
  font-size: 22px;
  color: var(--col-help-center-list-item);
  font-family: "Nunito", sans-serif;
  text-align: right;
  margin-bottom: 10px;
}

.help-center-control {
  display: flex;
}

.help-center-control-serach {
  border-radius: 5px;
  height: 40px;
  width: 180px;
  color: var(--col-help-center-list-item);
  font-family: "Nunito", sans-serif;
  font-size: 16px;
  font-weight: 900;

  background-image: url("/icons/search.svg");
  background-size: 30px 35px;
  background-repeat: no-repeat;
  text-indent: 20px;
}

.help-center-control-serach:focus {
  background-image: none;
  text-indent: 0;
  color: var(--col-help-center-list-item);
}

.help-center-navigate-button {
  height: 40px;
  width: 40px;
  border-radius: 5px;
  margin: auto;
  border: none;
}

.arrow-up {
  background: var(--col-help-center-navigator-up) url("/icons/arrow_up.svg")
  no-repeat center;
}

.arrow-down {
  background: var(--col-help-center-navigator-down) url("/icons/arrow_down.svg")
  no-repeat center;
  color: #ffffff;
}

.topic-title {
  font-size: 18px;
  font-family: "Nunito", sans-serif;
  font-weight: 900;
  color: var(--col-help-center-topic-title);
  margin: 10px 0;
}

.topic-description {
  font-size: 14px;
  font-family: "Nunito", sans-serif;
  font-weight: 400;
  color: var(--col-help-center-topic-title);
  margin-bottom: 25px;
}

.form-submit {
  display: flex;
  align-items: center;
  right: 45px;
  position: absolute;
  margin-top: -40px;
}

.feedback-form-area {
  height: 194px;
  width: 582px;
  border-radius: 5px;
  border: none;
  background: var(--col-help-center-feedback-form-color);
  font-size: 16px;
  font-family: "Nunito", sans-serif;
  font-weight: 900;
  color: var(--col-help-center-feedback-form-text);
  resize: none;
  padding: 10px;
}

.feedback-form-area:focus {
  color: #6f79a5;
}

.feedback-less-count {
  color: #FF2E77 !important;
}

.character-left {
  font-size: 14px;
  font-weight: 400;
  font-family: "Nunito", sans-serif;
  color: var(--col-help-center-topic-title);
  padding-right: 10px;
}

.character-count {
  font-weight: 900;
  color: var(--col-help-center-list-item);
}

.submit-button {
  height: 30px;
  width: 70px;
  border-radius: 5px;
  border: none;
  background: var(--col-help-center-list-item);
  color: #ffffff;
  font-family: 'Nunito', sans-serif;
  font-weight: 600;
  font-size: 16px;
}

.submit-button:disabled {
  background: #cdd7e1;
}

.help-center-list-item-selected {
  color: #FFD030;
}

.help-center-ask {
  position: absolute;
  bottom: 40px;
  right: 30px;
}

.ask-it-text {
  font-size: 18px;
  font-weight: 400;
  font-family: 'Nunito', sans-serif;
}

.ask-it-button {
  font-size: 18px;
  font-weight: 900;
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  text-decoration: underline;
  color: var(--col-help-center-list-item);
}

.help-center-list-add-new {
  text-decoration: underline;
  color: var(--col-help-center-list-item-new);
}

.help-center-item-edit {
  cursor: pointer;
  text-decoration: underline;
  color: var(--col-help-center-list-item-edit);
}

.add-new-item-form {
  display: grid;
}

.add-new-item-group {
  display: flex;
}


.add-new-item-long-text {
  border-radius: 5px;
  height: 40px;
  width: 585px;
  color: var(--col-help-center-list-item);
  font-family: "Nunito", sans-serif;
  font-size: 16px;
  font-weight: 900;
  margin-top: 10px;
  margin-bottom: 10px;
  border: none;
  padding: 10px;
}

.add-new-item-long-text:focus {
  text-indent: 0;
  color: var(--col-help-center-list-item);
}

.add-new-item-body {
  height: 100px;
  width: 582px;
  border-radius: 5px;
  border: none;
  font-size: 16px;
  font-family: "Nunito", sans-serif;
  font-weight: 400;
  resize: none;
  padding: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
}

.add-new-item-body:focus {
}

.add-new-order {
  border-radius: 5px;
  height: 40px;
  width: 50px;
  color: #969CBC;
  background: #F0F5FF;
  font-family: "Nunito", sans-serif;
  font-size: 16px;
  font-weight: 900;
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 10px;
  border: none;
}

.add-new-short-title {
  border-radius: 5px;
  height: 40px;
  width: 245px;
  color: #969CBC;
  background: #F0F5FF;
  font-family: "Nunito", sans-serif;
  font-size: 16px;
  font-weight: 900;
  margin: 10px;
  padding: 10px;
  border: none;
}

.add-new-image {
  border-radius: 5px;
  height: 40px;
  width: 96px;
  color: #969CBC;
  font-family: "Nunito", sans-serif;
  font-size: 16px;
  font-weight: 900;
  margin-right: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 5px;
  border: 4px solid #F0F5FF;
  cursor: pointer;
}

.delete-button {
  font-size: 16px;
  font-weight: 600;
  font-family: 'Nunito', sans-serif;
  cursor: pointer;
  text-decoration: underline;
  color: var(--col-help-center-list-item);
  margin-right: 10px;
}

.save-button {
  height: 30px;
  width: 70px;
  border-radius: 5px;
  border: none;
  background: var(--col-help-center-list-item);
  color: #ffffff;
  font-family: 'Nunito', sans-serif;
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
}

.save-button:disabled {
  background: #cdd7e1;
;
}

.add-new-color {
  border-radius: 5px;
  height: 40px;
  width: 90px;
  color: #969CBC;
  background: #F0F5FF;
  font-family: "Nunito", sans-serif;
  font-size: 16px;
  font-weight: 900;
  margin-right: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 10px;
  border: none;
}

.image-locator {
  padding: 7px 0;
  display: flex;
  margin-right: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  color: #3E4D86;
  font-family: "Nunito", sans-serif;
  font-size: 16px;
  font-weight: 900;
}

.delete-image {
  height: 24px;
  width: 24px;
  border-radius: 12px;
  border: none;
  background: #cdd7e1 url("/icons/image_close.svg")
  no-repeat center;
  cursor: pointer;
  margin-left: 5px;
}

.delete-confirm-text {
  font-family: "Nunito", sans-serif;
  font-size: 16px;
  font-weight: 400;
}

.delete-confirm-btn {
  cursor: pointer;
  text-decoration: underline;
  font-family: "Nunito", sans-serif;
  font-size: 16px;
  font-weight: 900;
}

.yes-btn {
  color: #388DFF;
}

.cancel-btn {
  color: #cdd7e1;
}

.input-error {
  border: 4px solid red !important;
}
</style>
