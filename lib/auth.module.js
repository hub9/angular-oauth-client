import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AuthService, AuthServiceConfig } from './auth.service';
import { AuthGuard } from './auth.guard';
var AuthModule = (function () {
    function AuthModule() {
    }
    AuthModule.forRoot = function (configData) {
        return {
            ngModule: AuthModule,
            providers: [
                { provide: AuthServiceConfig, useValue: configData },
                AuthService
            ]
        };
    };
    AuthModule.decorators = [
        { type: NgModule, args: [{
                    imports: [
                        HttpClientModule,
                    ],
                    providers: [
                        AuthGuard
                    ]
                },] },
    ];
    AuthModule.ctorParameters = function () { return []; };
    return AuthModule;
}());
export { AuthModule };
