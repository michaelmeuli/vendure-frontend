import { ScullyConfig } from '@scullyio/scully';
import './scully/plugins/productPlugin';
import './scully/plugins/categoryPlugin';

export const config: ScullyConfig = {
  projectRoot: './src',
  projectName: 'yl-shop-frontend',
  outDir: './dist/static',
  routes: {
    '/product/:slug': {
        type: 'products'
    },
    '/category/:slug': {
        type: 'categories'
    }
  },
  puppeteerLaunchOptions: {
    args: [
      '--disable-gpu',
      '--renderer',
      '--no-sandbox',
      '--no-service-autorun',
      '--no-experiments',
      '--no-default-browser-check',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-extensions'
    ]
  }
};
