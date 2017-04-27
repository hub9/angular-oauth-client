"use strict";
exports.__esModule = true;
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
var auth_service_1 = require("./auth.service");
var auth_guard_1 = require("./auth.guard");
var AuthModule = (function () {
    function AuthModule() {
    }
    AuthModule.forRoot = function (configData) {
        return {
            ngModule: AuthModule,
            providers: [
                { provide: auth_service_1.AuthServiceConfig, useValue: configData },
                auth_service_1.AuthService
            ]
        };
    };
    return AuthModule;
}());
AuthModule.decorators = [
    { type: core_1.NgModule, args: [{
                imports: [
                    http_1.HttpModule,
                ],
                providers: [
                    auth_guard_1.AuthGuard
                ]
            },] },
];
/** @nocollapse */
AuthModule.ctorParameters = function () { return []; };
exports.AuthModule = AuthModule;
