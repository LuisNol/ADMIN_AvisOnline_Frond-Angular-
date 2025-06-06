import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // 1) Si existe currentUserValue (usuario logueado), permitimos acceso
    if (this.authService.currentUserValue) {
      return true;
    }

    // 2) Si no hay usuario en currentUserValue, limpiamos estado y redirigimos
    this.authService.logout();
    this.router.navigate(['/auth/login']);
    return false;
  }
}
