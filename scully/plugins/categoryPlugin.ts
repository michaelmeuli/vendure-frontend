import { HandledRoute, registerPlugin } from '@scullyio/scully'

function categoryPlugin(route: string, config = {}): Promise<HandledRoute[]> {
  return Promise.resolve([
    { route: '/category/atherische-ole' },
    { route: '/category/ol-singles' },
    { route: '/category/olmischungen' }
  ]);
}

const validator = async (conf) => [];
registerPlugin('router', 'categories', categoryPlugin, validator);
