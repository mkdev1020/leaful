
const defaults = {
  challenge: null,
  inputCodes: [],
  success: false,
  checking: false,
  checked: false,
  isShowing: false,
};

/*
const imageTestData = `<?xml version="1.0" encoding="utf-8"?> <!-- Generator: Adobe Illustrator 16.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  --> <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"> <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="120px" height="120px" viewBox="0 0 120 120" enable-background="new 0 0 120 120" xml:space="preserve"> <g id="Layer_1"> </g> <g id="Layer_1_copy"> </g> <g id="Layer_1_copy_2"> </g> <g id="Layer_1_copy_3"> </g> <g id="Layer_1_copy_4"> </g> <g id="Layer_1_copy_5"> </g> <g id="Layer_1_copy_11"> </g> <g id="Layer_1_copy_10"> </g> <g id="Layer_1_copy_9"> </g> <g id="Layer_1_copy_8"> </g> <g id="Layer_1_copy_7"> </g> <g id="Layer_1_copy_6"> </g> <g id="Layer_1_copy_17"> </g> <g id="Layer_1_copy_16"> </g> <g id="Layer_1_copy_15"> <rect x="-1" y="-1" fill="#6B7E99" width="122" height="122"/> <g> <rect y="29.6699219" fill-rule="evenodd" clip-rule="evenodd" fill="none" width="113.2128906" height="83.3300781"/> <path fill="#E5E500" d="M56.3544922,31.9023438c7.1035156,0,13.2714844,2.5683594,18.5039063,7.703125 c5.2314453,5.1367188,7.8486328,11.5087891,7.8486328,19.1162109c0,7.6083984-2.4970703,14.0888672-7.4882813,19.4404297 c-4.9931641,5.3525391-11.1367188,8.0273438-18.4316406,8.0273438c-7.296875,0-13.5-2.6386719-18.6132813-7.9199219 C33.0625,72.9902344,30.5058594,66.703125,30.5058594,59.40625c0-3.984375,0.7207031-7.7158203,2.1601563-11.1972656 c1.4404297-3.4785156,3.359375-6.3945313,5.7607422-8.7470703c2.3994141-2.3515625,5.1591797-4.2001953,8.2802734-5.5439453 C49.8261719,32.5742188,53.0429688,31.9023438,56.3544922,31.9023438z M43.25,59.0458984 c0,4.2724609,1.3798828,7.7392578,4.140625,10.4033203c2.7597656,2.6640625,5.84375,3.9960938,9.2519531,3.9960938 s6.4804688-1.2949219,9.2158203-3.8876953c2.7363281-2.5917969,4.1044922-6.0712891,4.1044922-10.4404297 c0-4.3671875-1.3808594-7.8710938-4.140625-10.5117188c-2.7597656-2.6386719-5.84375-3.9599609-9.2519531-3.9599609 s-6.4804688,1.3320313-9.2158203,3.9960938S43.25,54.7734375,43.25,59.0458984z"/> </g> <g> <rect x="4" y="30.6699219" fill-rule="evenodd" clip-rule="evenodd" fill="none" width="113.2128906" height="87.3300781"/> <path fill="none" stroke="#000000" stroke-width="4" stroke-miterlimit="10" d="M60.3544922,32.9023438 c7.1035156,0,13.2714844,2.5683594,18.5039063,7.703125c5.2314453,5.1367188,7.8486328,11.5087891,7.8486328,19.1162109 c0,7.6083984-2.4970703,14.0888672-7.4882813,19.4404297c-4.9931641,5.3525391-11.1367188,8.0273438-18.4316406,8.0273438 c-7.296875,0-13.5-2.6386719-18.6132813-7.9199219C37.0625,73.9902344,34.5058594,67.703125,34.5058594,60.40625 c0-3.984375,0.7207031-7.7158203,2.1601563-11.1972656c1.4404297-3.4785156,3.359375-6.3945313,5.7607422-8.7470703 c2.3994141-2.3515625,5.1591797-4.2001953,8.2802734-5.5439453 C53.8261719,33.5742188,57.0429688,32.9023438,60.3544922,32.9023438z M47.25,60.0458984 c0,4.2724609,1.3798828,7.7392578,4.140625,10.4033203c2.7597656,2.6640625,5.84375,3.9960938,9.2519531,3.9960938 s6.4804688-1.2949219,9.2158203-3.8876953c2.7363281-2.5917969,4.1044922-6.0712891,4.1044922-10.4404297 c0-4.3671875-1.3808594-7.8710938-4.140625-10.5117188c-2.7597656-2.6386719-5.84375-3.9599609-9.2519531-3.9599609 s-6.4804688,1.3320313-9.2158203,3.9960938S47.25,55.7734375,47.25,60.0458984z"/> </g> </g> <g id="Layer_1_copy_14"> </g> <g id="Layer_1_copy_13"> </g> <g id="Layer_1_copy_12"> </g> <g id="Layer_1_copy_23"> </g> <g id="Layer_1_copy_22"> </g> <g id="Layer_1_copy_25"> </g> <g id="Layer_1_copy_24"> </g> <g id="Layer_1_copy_21"> </g> <g id="Layer_1_copy_20"> </g> <g id="Layer_1_copy_19"> </g> <g id="Layer_1_copy_18"> </g> </svg>`;
const defaults = {
  success: false,
  checking: false,
  checked: false,
  showing: false,
  challenge: {
    clue: 'Orbits the Earth.',
    id: '1234',
    inputs: [
      { code: '1234', image: imageTestData },
      { code: '2234', image: imageTestData },
      { code: '3234', image: imageTestData },
      { code: '4234', image: imageTestData },
    ],
  },
  inputCodes: [
    { code: '1234', image: imageTestData },
    { code: '2234', image: imageTestData },
    { code: '3234', image: imageTestData },
    { code: '4234', image: imageTestData },
  ],
};
/**/

export const state = () => Object.assign({}, defaults);

export const getters = {
  responseCodes(state) {
    return state.inputCodes.map(code => code.code);
  },
};

export const mutations = {

  clear(state) {
    for (const [key, val] of Object.entries(defaults)) {
      state[key] = val;
    }
  },

  set(state, values) {
    for (const [key, val] of Object.entries(values)) {
      state[key] = val;
    }
  },

  loadCaptchaFromResponseBody(state, response) {
    if (!response.captcha) {
      return;
    }

    state.challenge = response.captcha;
    state.inputCodes = response.captcha.inputs;
    state.isShowing = true;
  },

  updateCaptchaInputCodes(state, codes) {
    state.inputCodes = codes;
  },

  setChecking(state, checking) {
    state.checking = checking;
  },

  setSuccess(state, success) {
    state.checked = true;
    state.success = success;
  },

  clearSuccess(state) {
    state.checked = false;
    state.success = false;
  },

};
