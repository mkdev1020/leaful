<template>
  <div>
    <div class="info-line">
      <div v-if="!infoLineText">
        Admin Settings and Preferences ( <b>{{ settings.length }}</b> )
      </div>
      <div v-else v-html="infoLineText" />
    </div>

    <div class="divider-h" />
    <div class="stats-strip">
      <div class="stats-strip__content">

        <div class="settings-list">
          <div
            class="settings-list__entry"
            :class="{
              'settings-list__entry--selected': isSettingSelected(setting),
            }"
            v-for="setting in settings"
            :key="setting.title"
            @click="loadSetting(setting)"
          >
            {{ setting.title | capitalize }}
          </div>
        </div>

        <div class="stats-strip__divider" />

        <div v-if="selectedSetting">
          <component
            v-if="selectedSetting.type === 'user'"
            v-bind:is="selectedSetting.component || 'setting-value'"
            :type="selectedSettingValueType"
            :title="selectedSetting.title"
            :start-value="getUserValue(selectedSetting)"
            :description="selectedSetting.description"
            @update="(value) => { updateUserValue(selectedSetting, value) }"
          />
          <component
            v-else
            v-bind:is="selectedSetting.component || 'setting-value'"
            :type="selectedSettingValueType"
            :start-value="selectedSetting.value"
            :title="selectedSetting.title"
            :description="selectedSetting.description"
            @update="updateSelectedSetting"
          />
        </div>

      </div>
    </div>
    <div class="divider-h" />

    <div class="bottom-row">
      <div style="float: left">
        Bottom text here
      </div>
      <div style="float: right">
        <a href="#" style="color: #d0d0da; font-weight: bold">
          Sign Out
        </a>
      </div>
    </div>

  </div>
</template>

<style>
.settings-list {
  height: 130px;
  overflow-y: scroll;
}

.settings-list__entry {
  font-weight: bold;
}

.settings-list__entry--selected {
  color: blue;
}
</style>

<script>
import SettingValue from '../../components/settings/SettingValue';
import File from '../../components/settings/File';
import Colors from '../../components/settings/Colors';
import Password from '../../components/settings/Password';
import Texts from '../../components/settings/Texts';
import SecurityPattern from '../../components/settings/SecurityPattern';
import Pricing from '../../components/settings/Pricing';

export default {
  components: {
    SettingValue,
    File,
    Colors,
    Password,
    Texts,
    SecurityPattern,
    Pricing,
  },

  data() {
    return {
      infoLineText: '',
      infoLineTimeout: null,

      virtualSettings: [
        { title: 'Text Editor',    name: 'text_editor',    component: 'texts'},
        { title: 'Color Selector', name: 'color_selector', component: 'colors' },
      ],
      userSettings: [
        { title: 'Alias',            name: 'alias',                 valueType: 'string-short', description: `Cloaks your public name, with a "pen name," to facilitate anonymity.` },
        { title: 'Avatar',           name: 'avatar',                component: 'file',   description: `428x428 minimum. GIF, JPG, PNG, or SVG.` },
        { title: 'Biography',        name: 'about_me',              valueType: 'string' },
        { title: 'Email Address',    name: 'email',                 valueType: 'string-short', description: 'The default login, and communication email contact, for your Learningful account.' },
        { title: 'Messaging',        name: 'communication_enabled', valueType: 'boolean', description: 'Allow Learningful users to message you directly' },
        { title: 'Name',             name: 'name',                  valueType: 'string-short', description: 'Your real first and last name, which, absent an alias, identifies you to Learningful users.' },
        { title: 'Password',         name: 'password',              component: 'password', description: 'Must be 8 characters or more, include at least one number, and is case sensitive.' },
        { title: 'Recovery Email',   name: 'recovery_email',        valueType: 'string-short', description: "This email address can be used to recover your account, in the event you're locked out." },
        { title: 'Security Pattern', name: 'security_pattern',      component: 'security-pattern', description: "Provides and additional factor of security to your login." },
        { title: 'Username',         name: 'username',              valueType: 'string-short', description: "Publicly visible. Functions as your alternative login. 24 characters, max." },
      ],

      settingOverrides: {
        'pricing'       : { component: 'pricing' },
        'ad_minimums'   : { valueType: 'string-short' },
        'array_config'  : { valueType: 'string-short' },
        'download_limit': { valueType: 'string-short' },
        'purging'       : { valueType: 'string-short' },
      },

      settings: [],
      selectedSetting: null,

      user: {},
    };
  },

  computed: {
    selectedSettingValueType() {
      if (this.selectedSetting.type === 'user') {
        return this.selectedSetting.valueType || (typeof this.getUserValue(this.selectedSetting));
      }
      return this.selectedSetting.valueType || (typeof this.selectedSetting.value);
    },
  },

  methods: {
    loadSetting(setting) {
      this.selectedSetting = setting;
    },
    isSettingSelected(setting) {
      return setting.name === this.selectedSetting?.name;
    },
    async updateSelectedSetting(value) {
      await this.$sdk.patch(`/site-settings/${this.selectedSetting.id}`, {
        value,
      });

      this.selectedSetting.value = value;
    },

    async loadSiteSettings() {
      const response = await this.$sdk.get('/site-settings');
      const responseJson = await response.json();

      const settings = responseJson.settings;

      this.settings = settings.map(setting => {
        const overrides = this.settingOverrides[setting.name];
        if (overrides) {
          return Object.assign({}, setting, overrides);
        }
        return setting;
      });
      for (const virtualSetting of this.virtualSettings) {
        this.settings.push(Object.assign({}, virtualSetting, { type: 'virtual' }));
      }
      for (const userSetting of this.userSettings) {
        this.settings.push(Object.assign({}, userSetting, { type: 'user' }));
      }
      this.settings.sort((a, b) => {
        if (a.title < b.title) {
          return -1;
        }
        if (a.title > b.title) {
          return 1;
        }
        return 0;
      });
    },

    async loadUserSettings() {
      const response = await this.$sdk.get('/users/self');
      const responseJson = await response.json();

      this.user = responseJson.user;
    },

    getUserValue(userSetting) {
      const valueName = userSetting.name[0].toUpperCase() + userSetting.name.slice(1);
      const methodName = `getUserValue${valueName}`;
      if (this[methodName] !== undefined) {
        return this[methodName](userSetting);
      }
      return this.user[userSetting.name];
    },

    async updateUserValue(userSetting, value) {
      const valueName = userSetting.name[0].toUpperCase() + userSetting.name.slice(1);
      const methodName = `updateUserValue${valueName}`;
      if (this[methodName] !== undefined) {
        return await this[methodName](userSetting, value);
      }
      await this.patchUserValues({ [userSetting.name]: value });
    },

    async patchUserValues(values) {
      await this.$sdk.patch(`/users/self`, values);
      for (const [key, value] of Object.entries(values)) {
        this.user[key] = value;
      }
    },

    getUserValueName() {
      return `${this.user.first_name} ${this.user.last_name}`;
    },

    async updateUserValueName(userSetting, name) {
      const parts = name.split(' ');
      const first_name = parts[0];
      const last_name  = parts[1];
      await this.patchUserValues({
        first_name,
        last_name,
      });
    },

    getUserValueAlias() {
      if (!this.user.alias_first_name) {
        return '';
      }
      return `${this.user.alias_first_name} ${this.user.alias_last_name}`;
    },

    async updateUserValueAlias(userSetting, alias) {
      let alias_first_name = null;
      let alias_last_name  = null;

      if (alias) {
        const parts = alias.split(' ');
        alias_first_name = parts[0];
        alias_last_name  = parts[1];
      }

      await this.patchUserValues({
        alias_first_name,
        alias_last_name,
      });
    },

    getUserValueAvatar() {
      return this.user.avatar_locator;
    },

    async updateUserValueAvatar(userSetting, file) {
      const formData = new FormData();
      formData.append('image', file);

      const response = await this.$sdk.put('/users/self/avatar', formData);
      const responseJson = await response.json();

      this.user.avatar_locator = responseJson.avatarLocator;
    },

  },

  async mounted() {
    await Promise.all([
      this.loadSiteSettings(),
      this.loadUserSettings(),
    ]);
  },
};

</script>
