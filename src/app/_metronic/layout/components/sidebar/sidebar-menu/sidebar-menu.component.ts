import { Component, OnInit } from '@angular/core';
import { PermissionService } from 'src/app/modules/auth/services/permission.service';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements OnInit {

  constructor(public permissionService: PermissionService) { }

  ngOnInit(): void {
    console.log('Inicializando SidebarMenuComponent');
    
    // Los permisos ya deberían estar cargados por el APP_INITIALIZER
    // Solo recargamos si no hay permisos en memoria o localStorage
    if (!localStorage.getItem('user_permissions')) {
      this.permissionService.loadUserPermissions().subscribe({
        next: (permissions) => {
          console.log('Permisos cargados en sidebar:', permissions);
        },
        error: (error) => {
          console.error('Error al cargar permisos en sidebar:', error);
        }
      });
    }
  }

  // Método para comprobar si el usuario tiene permiso para ver un elemento del menú
  hasPermission(permission: string): boolean {
    return this.permissionService.hasPermission(permission);
  }

  // Método para comprobar si el usuario tiene un rol específico
  hasRole(role: string): boolean {
    return this.permissionService.hasRole(role);
  }

  // Método para comprobar si el usuario tiene alguno de los permisos listados
  hasAnyPermission(permissions: string[]): boolean {
    return this.permissionService.hasAnyPermission(permissions);
  }
}
