"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataService = void 0;
const core_1 = require("@angular/core");
const core_2 = require("@apollo/client/core");
const ng_lib_1 = require("@scullyio/ng-lib");
const operators_1 = require("rxjs/operators");
let DataService = class DataService {
    constructor(apollo, transferStateService) {
        this.apollo = apollo;
        this.transferStateService = transferStateService;
        this.context = {
            headers: {},
        };
    }
    query(query, variables, fetchPolicy) {
        if (ng_lib_1.isScullyGenerated()) {
            return this.transferStateService.getState('appTranferState');
        }
        return this.apollo
            .watchQuery({
            query,
            variables,
            context: this.context,
            fetchPolicy: fetchPolicy || 'cache-first',
        })
            .valueChanges.pipe(operators_1.filter((result) => result.networkStatus === core_2.NetworkStatus.ready), operators_1.map((response) => response.data), operators_1.tap((data) => this.transferStateService.setState('appTranferState', data)));
    }
    mutate(mutation, variables) {
        return this.apollo
            .mutate({
            mutation,
            variables,
            context: this.context,
        })
            .pipe(operators_1.map((response) => response.data));
    }
};
DataService = __decorate([
    core_1.Injectable({
        providedIn: 'root',
    })
], DataService);
exports.DataService = DataService;
//# sourceMappingURL=data.service.js.map