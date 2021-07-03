
const { Response, Request, Headers, fetch } = require('whatwg-fetch');
global.Response = Response;
global.Request = Request;
global.Headers = Headers;
global.fetch = fetch;

// global.fetch = require('node-fetch');

const { Sdk } = require('./learningful-sdk.js');

test('authentication', async function () {
  const sdk = Sdk.getStub();

  await sdk.authenticate({
    username: "jknotek@fossil.icu",
    password: "test1234",
  });

  let response;
  let responseJson;

  response = await sdk.fetch('/test/token-heartbeat');
  responseJson = await response.json();

  console.log(responseJson.reason == 'stale_heartbeat' ? '...Pass!' : '...FAIL!');

  response = await sdk.post('/auth/token-heartbeat', {
    password: 'test1234',
  });
  responseJson = await response.json();
  // responseJson = await response.text();
  console.log('heartbeat:', responseJson);


  response = await sdk.fetch('/test/token-heartbeat');
  responseJson = await response.json();
  console.log("NEW:", responseJson);

});
