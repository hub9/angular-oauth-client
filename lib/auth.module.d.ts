import { ModuleWithProviders } from '@angular/core';
export interface AuthServiceConfigType {
    apiId: number | string;
    apiSecret: number | string;
    apiUrl: string;
    apiOauthUrl: string;
    unauthorizedRoute?: string;
}
export declare class AuthModule {
    static forRoot(configData: AuthServiceConfigType): ModuleWithProviders;
}
