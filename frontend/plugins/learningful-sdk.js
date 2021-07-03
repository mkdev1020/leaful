
import { Sdk } from '../lib/learningful-sdk';

export default (context, inject) => {
  const sdk = new Sdk(context);
  sdk.load();
  inject('sdk', sdk);
};
