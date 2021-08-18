
class Sdk {
  // TODO TODO TODO: grab from config
  static baseUrl = `http://localhost:3456/api`;

  constructor(context) {
    this.context = context;

    this.requestBlockingEnabled = true;
    this.requestBlockedByCaptcha = null;
    this.initBlockedRequest();
  }

  static getStub() {
    return new Sdk({
      store: {
        state: {
          main: {
            accessToken: null,
            requestLimit: {},
          },
        },
        commit() { },
      },
    });
  }

  get accessToken() {
    return this.context.store.state.main.accessToken;
  }

  applyAuthHeader(headers) {
    const headersCopy = Object.assign({}, headers);
    if (this.accessToken) {
      headersCopy.Authorization = `Bearer ${this.accessToken}`;
    }
    return headersCopy;
  }

  async fetch(url, options = {}) {
    const baseOptions = {
      method: 'get',
      headers: this.applyAuthHeader({
        'Content-Type': 'application/json',
      }),
    };

    const allOptions = Object.assign({}, baseOptions, options);
    const fullUrl = `${Sdk.baseUrl}${url}`

    return await this.processFetch(fullUrl, allOptions);
  }

  async processFetch(url, options = {}) {
    let response = await fetch(url, options);

    const responseJson = await this.getJsonBodySafely(response);
    if (response.status === 401 && responseJson.reason === 'requires_captcha') {
      this.context.store.commit('captcha/loadCaptchaFromResponseBody', responseJson);
      if (!this.requestBlockedPromise && this.requestBlockingEnabled) {
        response = await this.blockRequestUntilCaptchaSolved({ url, options });
      }
    }

    if (response.status === 401 && responseJson.reason === 'invalid_token') {
      this.context.store.commit('main/set', { postAuthReload: true });
      this.promptAuthentication();
      return response;
    }

    if (response.status === 429) {
      this.context.store.dispatch('main/setRequestLimitExceeded', {
        isExceeded : true,
        earliestRetry : responseJson.earliestRetry,
        isLocked      : responseJson.isLocked,
        url,
      });
    }
    else if (!this.isStatusCodeAnError(response.status)) {
      const requestLimit = this.context.store.state.main.requestLimit;
      if (url === requestLimit.url) {
        await this.context.store.dispatch('main/clearRequestLimitExceeded');
      }
    }

    return response;
  }

  isStatusCodeAnError(code) {
    if (code >= 400 && code <= 499) {
      return true;
    }

    if (code >= 500 && code <= 599) {
      return true;
    }

    return false;
  }

  async blockRequestUntilCaptchaSolved({ url, options }) {
    this.requestBlockedByCaptcha = {
      url,
      options,
    };

    this.requestBlockedPromise = new Promise((resolve) => {
      this.resolveBlockedRequest = resolve;
    });

    const response = await this.requestBlockedPromise;
    return response;
  }

  initBlockedRequest() {
    this.requestBlockedByCaptcha = null;
    this.requestBlockedPromise = null;
    this.resolveBlockedRequest = () => {};
  }

  async clearBlockedRequest(response) {
    this.context.store.commit('captcha/setChecking', false);
    this.context.store.commit('captcha/setSuccess', true);

    await new Promise((resolve) => {
      window.setTimeout(resolve, 500);
    });

    this.context.store.commit('captcha/set', {
      isShowing: false,
    });

    await new Promise((resolve) => {
      window.setTimeout(resolve, 500);
    });

    this.resolveBlockedRequest(response);
    this.initBlockedRequest();
    this.context.store.commit('captcha/clear');
  }

  async replayRequestBlockedByCaptcha() {
    if (!this.requestBlockedByCaptcha) {
      throw new Error(`No request to replay!`);
    }

    const captchaResponse = {
      id         : this.context.store.state.captcha.challenge.id,
      inputCodes : this.context.store.getters['captcha/responseCodes'],
    };

    const { url, options } = this.requestBlockedByCaptcha;

    const optionsWithCaptcha = Object.assign({}, options, {
      body: JSON.stringify(
        Object.assign({}, JSON.parse(options.body), {
          captcha: captchaResponse,
        })
      ),
    });

    this.context.store.commit('captcha/setChecking', true);
    const response = await this.processFetch(url, optionsWithCaptcha);

    const responseJson = await this.getJsonBodySafely(response);
    if (this.requestBlockedByCaptcha) {
      if (!(response.status === 401 && responseJson.reason === 'requires_captcha')) {
        await this.clearBlockedRequest(response);
      }
      else {
        this.context.store.commit('captcha/setChecking', false);
        this.context.store.commit('captcha/setSuccess', false);
        await new Promise((resolve) => {
          window.setTimeout(resolve, 2000);
        });
        this.context.store.commit('captcha/clearSuccess');
      }
    }

    return response;
  }

  async getJsonBodySafely(response) {
    const responseClone = response.clone();
    try {
      const json = await responseClone.json();
      return json;
    } catch (e) {
      return {};
    }
  }

  async get(url, params = {}) {
    const searchParams = new URLSearchParams(params);
    const urlWithParams = url + '?' + searchParams.toString();
    return await this.fetch(urlWithParams);
  }

  async performRequestWithBody(method, url, body) {
    if (body.constructor?.name === 'FormData') {
      return await this.fetch(url, {
        method,
        body,
        headers: this.applyAuthHeader({}),
      });
    }

    return await this.fetch(url, {
      method,
      body: JSON.stringify(body),
    });
  }

  async post(url, body) {
    return await this.performRequestWithBody('POST', url, body);
  }

  async put(url, body) {
    return await this.performRequestWithBody('PUT', url, body);
  }

  async patch(url, body) {
    return await this.performRequestWithBody('PATCH', url, body);
  }

  async delete(url, body= {}) {
    return await this.performRequestWithBody('DELETE', url, {});
  }

  async authenticate(credentials) {
    const response = await this.post(`/auth/token`, credentials);

    if (response.status !== 200) {
      throw new Error(`Invalid credentials`);
    }

    const data = await response.json();

    // this.accessToken = data.accessToken;
    await this.context.store.commit('main/parseJwt', data.accessToken);
    this.context.store.commit('main/setAccessToken', data.accessToken);
    this.context.store.commit('main/setUser', data.userdata);
    this.context.store.commit('main/saveToLocalStorage');
  }

  isAuthenticated() {
    // TODO TODO TODO: make sure auth token is still valid
    return !!this.accessToken;
  }

  promptAuthentication(redirect = null) {
    this.context.store.commit('main/promptAuthentication');
    this.context.store.commit('main/setPostAuthRedirect', redirect);
  }

  async finishAuthentication() {
    await this.context.store.dispatch('main/finishAuthentication');
  }

  clearAuthentication() {
    this.context.store.commit('main/set', { accessToken: null });
    this.save();
    $nuxt.$router.go('/test/homepage-layout');
  }

  load() {
    this.context.store.commit('main/loadFromLocalStorage');
  }

  save() {
    this.context.store.commit('main/saveToLocalStorage');
  }

  async isEmailRecognized(email) {
    const response = await this.get('/auth/username-validation', {
      username: email,
    });

    if (response.status === 404) {
      return false;
    }

    if (response.status === 200) {
      return true;
    }
  }

  async getRandomProTip() {
    const response = await this.get('/help/random-pro-tip');
    const body = await response.json();
    return body.proTip;
  }

  async sendLoginLink(email) {
    return await this.post('/auth/token/email-login-link', {
      username: email,
    });
  }

  async register(data) {
    return await this.post('/auth/sign-up', data);
  }

}

module.exports.Sdk = Sdk;
