import { ScullyConfig } from '@scullyio/scully';

import './scully/plugins/productPlugin';

export const config: ScullyConfig = {
  projectRoot: './src',
  projectName: 'yl-shop-frontend',
  outDir: './dist/static',
  routes: {
    '/product/:slug': {
        type: 'products',
    }
  }
};
