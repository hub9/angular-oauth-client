import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, AuthServiceConfig } from './auth.service';
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
    AuthGuard.decorators = [
        { type: Injectable },
    ];
    AuthGuard.ctorParameters = function () { return [
        { type: AuthServiceConfig, },
        { type: AuthService, },
        { type: Router, },
    ]; };
    return AuthGuard;
}());
export { AuthGuard };
