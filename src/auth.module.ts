import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpModule } from '@angular/http';
import { AuthService, AuthServiceConfig } from './auth.service';
import { AuthGuard } from './auth.guard';

export interface AuthServiceConfigType {
  apiId: number | string;
  apiSecret: number | string;
  apiUrl: string;
  unauthorizedRoute?: string;
}

@NgModule({
  imports: [
    HttpModule,
  ],
  providers: [
    AuthGuard
  ]
})
export class AuthModule {
  static forRoot(configData: AuthServiceConfigType): ModuleWithProviders {
    return {
      ngModule: AuthModule,
      providers: [
        {provide: AuthServiceConfig, useValue: configData},
        AuthService
      ]
    };
  }
}
