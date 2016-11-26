import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import { Http } from '@angular/http';
export declare class AuthServiceConfig {
    apiId: string;
    apiSecret: string;
    apiUrl: string;
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
    get(url: any): string;
    post(url: any, data: any): string;
    put(url: any, data: any): string;
    delete(url: any): string;
}
