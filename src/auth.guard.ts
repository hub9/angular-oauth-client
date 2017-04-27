import {Injectable} from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';

import {AuthService, AuthServiceConfig} from './auth.service';


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private config: AuthServiceConfig, private authService: AuthService, private router: Router) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const nextUrl = state.url;

    if (this.authService.isAuthenticated) {
      return true;
    }
    this.router.navigate([this.config.unauthorizedRoute], {queryParams: {next: encodeURIComponent(nextUrl)}});
    return false;
  }
}