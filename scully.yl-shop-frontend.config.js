"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var scully_1 = require("@scullyio/scully");
var DisableAngular = require('scully-plugin-disable-angular').DisableAngular;
require("./scully/plugins/productPlugin");
var postRenderers = [DisableAngular];
scully_1.setPluginConfig(DisableAngular, 'render', {
    removeState: true,
});
exports.config = {
    projectRoot: "./src",
    defaultPostRenderers: postRenderers,
    projectName: "yl-shop-frontend",
    outDir: './dist/static',
    routes: {
        '/product/:slug': {
            type: 'products',
        }
    },
    puppeteerLaunchOptions: {
        args: [
            "--disable-gpu",
            "--renderer",
            "--no-sandbox",
            "--no-service-autorun",
            "--no-experiments",
            "--no-default-browser-check",
            "--disable-dev-shm-usage",
            "--disable-setuid-sandbox",
            "--no-first-run",
            "--no-zygote",
            "--single-process",
            "--disable-extensions"
        ]
    }
};
