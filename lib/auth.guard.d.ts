import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService, AuthServiceConfig } from './auth.service';
export declare class AuthGuard implements CanActivate {
    private config;
    private authService;
    private router;
    constructor(config: AuthServiceConfig, authService: AuthService, router: Router);
    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean;
}
