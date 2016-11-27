import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import { Http } from '@angular/http';
export declare class AuthServiceConfig {
    apiId: string;
    apiSecret: string;
    apiUrl: string;
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
    login(username: string, password: string): Observable<any>;
    logout(): void;
    refresh_token(): Observable<any>;
    getToken(): Observable<any>;
    request(method: string, url: string, data?: any, headers?: any): Observable<any>;
    get(url: string): Observable<any>;
    post(url: string, data: any): Observable<any>;
    patch(url: string, data: any): Observable<any>;
    delete(url: string): Observable<any>;
}
