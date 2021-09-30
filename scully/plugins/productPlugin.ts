import { HandledRoute, registerPlugin } from '@scullyio/scully'
import fetch from 'node-fetch';

async function test() {
    const response = await fetch('https://github.com/');
    const body = await response.text();
    
    console.log(body);
}


function productPlugin(route: string, config = {}): Promise<HandledRoute[]> {
    test();
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
