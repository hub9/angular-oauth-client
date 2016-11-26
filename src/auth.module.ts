import {NgModule, ModuleWithProviders} from '@angular/core';
import {HttpModule} from '@angular/http';
import {AuthService, AuthServiceConfig} from './auth.service';


@NgModule({
  imports: [
    HttpModule,
  ],
  providers: [
    AuthService
  ]
})
export class AuthModule {
  static forRoot(apiId: string, apiSecret: string, apiUrl: string): ModuleWithProviders {
    return {
      ngModule: AuthModule,
      providers: [
        {provide: AuthServiceConfig, useValue: {apiId, apiSecret, apiUrl}}
      ]
    };
  }
}
