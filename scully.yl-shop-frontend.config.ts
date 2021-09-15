import { ScullyConfig, setPluginConfig } from '@scullyio/scully';
const { DisableAngular } = require('scully-plugin-disable-angular');
import './scully/plugins/productPlugin';

const postRenderers = [DisableAngular];

setPluginConfig(DisableAngular, 'render', {
  removeState: true,
});

export const config: ScullyConfig = {
  projectRoot: "./src",
  defaultPostRenderers: postRenderers,
  projectName: "yl-shop-frontend",
  outDir: './dist/static',
  routes: {
    '/product/:slug': {
        type: 'products',
    }
  }
};
