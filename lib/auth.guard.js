"use strict";
exports.__esModule = true;
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var auth_service_1 = require("./auth.service");
var AuthGuard = (function () {
    function AuthGuard(config, authService, router) {
        this.config = config;
        this.authService = authService;
        this.router = router;
    }
    AuthGuard.prototype.canActivate = function (next, state) {
        var nextUrl = state.url;
        if (this.authService.isAuthenticated) {
            return true;
        }
        this.router.navigate([this.config.unauthorizedRoute], { queryParams: { next: encodeURIComponent(nextUrl) } });
        return false;
    };
    return AuthGuard;
}());
AuthGuard.decorators = [
    { type: core_1.Injectable },
];
/** @nocollapse */
AuthGuard.ctorParameters = function () { return [
    { type: auth_service_1.AuthServiceConfig },
    { type: auth_service_1.AuthService },
    { type: router_1.Router },
]; };
exports.AuthGuard = AuthGuard;
