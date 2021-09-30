import { HandledRoute, registerPlugin } from '@scullyio/scully'

import fetch from 'cross-fetch';
// Or just: import 'cross-fetch/polyfill';

fetch('//api.github.com/users/lquixada')
  .then(res => {
    if (res.status >= 400) {
      throw new Error("Bad response from server");
    }
    return res.json();
  })
  .then(user => {
    console.log(user);
  })
  .catch(err => {
    console.error(err);
  });

function productPlugin(route: string, config = {}): Promise<HandledRoute[]> {
  return Promise.resolve([
    { route: '/product/bergamotte-15ml' },
    { route: '/product/basilikum-15ml' },
    { route: '/product/lebensbaum-5ml' },
    { route: '/product/schwarzer-pfeffer-5ml' },
    { route: '/product/schwarzfichte-5ml' },
    { route: '/product/blauer-rainfarn-5ml' },
  ]);
}

const validator = async (conf) => [];
registerPlugin('router', 'products', productPlugin, validator);
