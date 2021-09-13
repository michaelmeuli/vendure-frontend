import { HandledRoute, registerPlugin } from '@scullyio/scully'

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
