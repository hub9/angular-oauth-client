import * as Rx from 'rxjs/Rx';
import { Http } from '@angular/http';
export declare class AuthServiceConfig {
    apiId: string;
    apiSecret: string;
    apiUrl: string;
    apiOauthUrl: string;
    unauthorizedRoute: string;
}
export declare class AuthService {
    private config;
    private http;
    isAuthenticated: boolean;
    token: string;
    me: any;
    private authData;
    constructor(config: AuthServiceConfig, http: Http);
    login(username: string, password: string): Rx.Observable<any>;
    logout(): void;
    refresh_token(): Rx.Observable<any>;
    getToken(): Rx.Observable<any>;
    request(method: string, url: string, data?: any, headers?: any): Rx.Observable<any>;
    get(url: string): Rx.Observable<any>;
    post(url: string, data: any): Rx.Observable<any>;
    patch(url: string, data: any): Rx.Observable<any>;
    delete(url: string): Rx.Observable<any>;
}
