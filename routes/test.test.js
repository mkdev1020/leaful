

const { DateTime } = require('luxon');
const { Response, Request, Headers, fetch } = require('whatwg-fetch');
global.Response = Response;
global.Request = Request;
global.Headers = Headers;
global.fetch = fetch;

// global.fetch = require('node-fetch');

const { Sdk } = require('../frontend/lib/learningful-sdk.js');

function timeout(duration) {
  return new Promise(resolve => {
    global.setTimeout(resolve, duration);
  });
}

test('throttler middleware', async function () {
  jest.setTimeout(120 * 1000);

  const sdk = Sdk.getStub();

  let response;
  let responseJson;

  for (let i = 0; i < 10; i++) {
    response = await sdk.fetch('/test/throttle?thing=that&that=thing');
    responseJson = await response.json();

    if (response.status === 429) {
      if (responseJson.isLocked) {
        break;
      }

      const waitTimeSeconds = DateTime.fromISO(responseJson.earliestRetry)
        .diff(DateTime.now().toUTC())
        .as('seconds');

      await timeout(waitTimeSeconds * 1000);
    }
  }

  response = await sdk.fetch('/test/throttle?thing=that&that=thing');
  responseJson = await response.json();
  expect(responseJson.isLocked).toBe(true);

  response = await sdk.fetch('/test/login-token');
  responseJson = await response.json();
  const loginToken = responseJson.loginToken;

  console.log('response', responseJson);
  console.log('login token:', loginToken);

  response = await sdk.post('/auth/token/login-token', {
    loginToken,
  });
  responseJson = await response.json();
  expect(responseJson.accessToken).toBeTruthy();

  //
  // after using the login token, we should no longer be locked out
  //
  response = await sdk.fetch('/test/throttle?thing=that&that=thing');
  responseJson = await response.json();
  expect(responseJson.isLocked).toBeFalsy();

});
