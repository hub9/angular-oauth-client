import * as Rx from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
var AuthServiceConfig = (function () {
    function AuthServiceConfig() {
    }
    return AuthServiceConfig;
}());
export { AuthServiceConfig };
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
        var headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        var r = this.http.post(this.config.apiOauthUrl + 'token/', data, { headers: headers });
        return r.map(function (res) {
            _this.authData = res;
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
        var headers = new HttpHeaders();
        headers.set('Content-Type', 'application/x-www-form-urlencoded');
        headers.set('Authorization', 'Bearer ' + this.authData.refresh_token);
        console.log("kajshdkajshd teste");
        return this.http.post(this.config.apiOauthUrl + 'token/', data, { headers: headers })
            .do(function (d) {
        }, function (e) {
            if (e.status === 401) {
                _this.logout();
            }
        })
            .map(function (res) {
            _this.authData = res;
            _this.token = _this.authData.access_token;
            _this.isAuthenticated = true;
            _this.authData.expiration = new Date().getTime() + (_this.authData.expires_in * 1000);
            window.localStorage.setItem('auth_data', JSON.stringify(_this.authData));
            return _this.authData;
        });
    };
    AuthService.prototype.getToken = function () {
        var _this = this;
        return Rx.Observable.create(function (observer) {
            if (_this.token != null) {
                if (!_this.authData.expiration || _this.authData.expiration <= new Date().getTime() + 100000) {
                    _this.refresh_token().subscribe(function (d) {
                        observer.next(_this.token);
                        observer.complete();
                    });
                }
                else {
                    observer.next(_this.token);
                    observer.complete();
                }
            }
            else {
                observer.next(null);
                observer.complete();
            }
        });
    };
    AuthService.prototype.request = function (method, url, data, headers) {
        var _this = this;
        if (data === void 0) { data = {}; }
        if (headers === void 0) { headers = new HttpHeaders(); }
        var formData = new FormData();
        var hasFile = assignFormdata(formData, data);
        if (!hasFile) {
            data = JSON.stringify(data);
        }
        else {
            data = formData;
        }
        return Rx.Observable.create(function (obs) {
            _this.getToken().subscribe(function (d1) {
                headers.set('Authorization', 'Bearer ' + _this.token);
                if (!hasFile) {
                    headers.set('Content-Type', 'application/json');
                }
                var options = { headers: headers, body: data };
                var req = new HttpRequest(method, _this.config.apiUrl + url, options);
                _this.http.request(req).subscribe(function (d2) {
                    console.log("request response", d2);
                }, function (e) {
                    if (e.status === 401) {
                        _this.logout();
                    }
                    obs.error(e);
                }, function () { return obs.complete(); });
            });
        });
    };
    AuthService.prototype.get = function (url) {
        return this.request('GET', url);
    };
    AuthService.prototype.post = function (url, data) {
        return this.request('POST', url, data);
    };
    AuthService.prototype.patch = function (url, data) {
        return this.request('PATCH', url, data);
    };
    AuthService.prototype.delete = function (url) {
        return this.request('DELETE', url);
    };
    AuthService.decorators = [
        { type: Injectable },
    ];
    AuthService.ctorParameters = function () { return [
        { type: AuthServiceConfig, },
        { type: HttpClient, },
    ]; };
    return AuthService;
}());
export { AuthService };
function assignFormdata(formdata, data) {
    var hasFile = false;
    for (var i in data) {
        if (data[i] instanceof File) {
            formdata.append(i, data[i]);
            hasFile = true;
        }
        else if (data[i] instanceof Object) {
            formdata.append(i, JSON.stringify(data[i]));
        }
        else {
            formdata.append(i, data[i]);
        }
    }
    return hasFile;
}
