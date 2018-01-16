import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router'
import { AuthService } from './auth.service'
import { AuthServiceConfig } from './auth.service.config'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private config: AuthServiceConfig,
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.isAuthenticated()) {
      return true
    }

    const nextUrl = encodeURIComponent(state.url)

    this.router.navigate([this.config.unauthorizedRoute], { queryParams: { next: nextUrl } })

    return false
  }
}
