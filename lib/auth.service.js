"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
require('rxjs/add/operator/map');
require('rxjs/add/operator/do');
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
var AuthServiceConfig = (function () {
    function AuthServiceConfig() {
    }
    return AuthServiceConfig;
}());
exports.AuthServiceConfig = AuthServiceConfig;
var AuthService = (function () {
    function AuthService(config, http) {
        this.config = config;
        this.http = http;
        this.isAuthenticated = false;
        this.token = null;
        this.me = {};
        this.authData = {};
        var t = window.localStorage.getItem('auth_data');
        if (t != null) {
            this.authData = JSON.parse(t);
            this.token = this.authData.access_token;
            this.isAuthenticated = true;
            if (this.authData.expiration <= new Date().getTime() + 100000) {
                this.refresh_token().subscribe();
            }
        }
    }
    AuthService.prototype.login = function (username, password) {
        var _this = this;
        var data = 'username=' + username + '&password=' + password + '&grant_type=password&client_id=' +
            this.config.apiId + '&client_secret=' + this.config.apiSecret;
        var headers = new http_1.Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
        var options = new http_1.RequestOptions({ headers: headers });
        var r = this.http.post(this.config.apiUrl + 'o/token/', data, options);
        return r.map(function (res) {
            _this.authData = res.json();
            _this.token = _this.authData.access_token;
            _this.isAuthenticated = true;
            _this.authData.expiration = new Date().getTime() + (_this.authData.expires_in * 1000);
            window.localStorage.setItem('auth_data', JSON.stringify(_this.authData));
            return _this.authData;
        });
    };
    AuthService.prototype.logout = function () {
        this.token = null;
        this.isAuthenticated = false;
        this.authData = {};
        window.localStorage.removeItem('auth_data');
    };
    AuthService.prototype.refresh_token = function () {
        var _this = this;
        var data = 'grant_type=refresh_token&client_id=' + this.config.apiId + '&client_secret=' +
            this.config.apiSecret + '&refresh_token=' + this.authData.refresh_token;
        var headers = new http_1.Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer ' + this.authData.refresh_token
        });
        var options = new http_1.RequestOptions({ headers: headers });
        return this.http.post(this.config.apiUrl + 'o/token/', data, options)
            .do(function (d) {
        }, function (e) {
            if (e.status === 401) {
                _this.logout();
            }
        })
            .map(function (res) {
            _this.authData = res.json();
            _this.token = _this.authData.access_token;
            _this.isAuthenticated = true;
            _this.authData.expiration = new Date().getTime() + (_this.authData.expires_in * 1000);
            window.localStorage.setItem('auth_data', JSON.stringify(_this.authData));
            return _this.authData;
        });
    };
    // TODO: Authenticated http methods
    AuthService.prototype.get = function (url) {
        return '';
    };
    AuthService.prototype.post = function (url, data) {
        return '';
    };
    AuthService.prototype.put = function (url, data) {
        return '';
    };
    AuthService.prototype.delete = function (url) {
        return '';
    };
    AuthService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [AuthServiceConfig, http_1.Http])
    ], AuthService);
    return AuthService;
}());
exports.AuthService = AuthService;
