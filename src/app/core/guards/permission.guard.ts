import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { PermissionService } from 'src/app/modules/auth/services/permission.service';

@Injectable({ providedIn: 'root' })
export class PermissionGuard {
  constructor(
    private permissionService: PermissionService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log('PermissionGuard: verificando acceso a ruta', state.url);
    
    // Verificar si hay datos de permiso requeridos en la ruta
    const requiredPermission = route.data['permission'] as string;
    const requiredRole = route.data['role'] as string;
    
    // Si no hay requisitos específicos, permitir acceso
    if (!requiredPermission && !requiredRole) {
      console.log('No hay requisitos de permisos para esta ruta, permitiendo acceso');
      return true;
    }
    
    // Verificar permisos
    if (requiredPermission) {
      const hasPermission = this.permissionService.hasPermission(requiredPermission);
      console.log(`Verificando permiso ${requiredPermission}: ${hasPermission}`);
      if (!hasPermission) {
        console.log('Permiso denegado, redirigiendo a error 404');
        this.router.navigate(['/error/404']);
        return false;
      }
    }
    
    // Verificar roles
    if (requiredRole) {
      const hasRole = this.permissionService.hasRole(requiredRole);
      console.log(`Verificando rol ${requiredRole}: ${hasRole}`);
      if (!hasRole) {
        console.log('Rol no autorizado, redirigiendo a error 404');
        this.router.navigate(['/error/404']);
        return false;
      }
    }
    
    return true;
  }
} 