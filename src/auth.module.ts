import {NgModule, ModuleWithProviders} from '@angular/core';
import {HttpModule} from '@angular/http';
import {AuthService, AuthServiceConfig} from './auth.service';
import {AuthGuard} from './auth.guard';


@NgModule({
  imports: [
    HttpModule,
  ],
  providers: [
    AuthService,
    AuthGuard
  ]
})
export class AuthModule {
  static forRoot(configData: any): ModuleWithProviders {
    return {
      ngModule: AuthModule,
      providers: [
        {provide: AuthServiceConfig, useValue: configData}
      ]
    };
  }
}
