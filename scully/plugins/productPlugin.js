"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scully_1 = require("@scullyio/scully");
function productPlugin(route, config = {}) {
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
scully_1.registerPlugin('router', 'products', productPlugin, validator);
//# sourceMappingURL=productPlugin.js.map