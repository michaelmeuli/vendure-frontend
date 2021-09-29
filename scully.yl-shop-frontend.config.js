"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require("./scully/plugins/productPlugin");
exports.config = {
    projectRoot: "./src",
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
