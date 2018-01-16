import { HttpClientModule } from '@angular/common/http'
import { ModuleWithProviders, NgModule } from '@angular/core'
import { AuthGuard } from './auth.guard'
import { AuthService } from './auth.service'
import { AuthServiceConfig } from './auth.service.config'

@NgModule({
  imports: [HttpClientModule],
  providers: [AuthGuard],
})
export class AuthModule {
  static forRoot(configData: AuthServiceConfig): ModuleWithProviders {
    return {
      ngModule: AuthModule,
      providers: [
        { provide: AuthServiceConfig, useValue: configData },
        AuthService,
      ],
    }
  }
}
