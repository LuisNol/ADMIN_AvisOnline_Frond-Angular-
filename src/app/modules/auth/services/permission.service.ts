import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { URL_SERVICIOS } from 'src/app/config/config';

export interface PermissionResponse {
  permissions: {
    'full-admin': boolean;
    'manage-users': boolean;
    'manage-all-announcements': boolean;
    'manage-own-announcements': boolean;
    'manage-categories': boolean;
    'manage-sliders': boolean;
    [key: string]: boolean;
  };
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private permissionsSubject = new BehaviorSubject<PermissionResponse | null>(null);
  public permissions$ = this.permissionsSubject.asObservable();
  
  // Evitar logs repetitivos
  private permissionsLogged = new Set<string>();
  private rolesLogged = new Set<string>();

  // Permisos por defecto para usuarios normales (RESTRINGIDOS)
  private defaultPermissions: PermissionResponse = {
    permissions: {
      'full-admin': false,
      'manage-users': false,
      'manage-all-announcements': false,
      'manage-own-announcements': true, // Solo pueden gestionar sus anuncios
      'manage-categories': false,
      'manage-sliders': false
    },
    roles: ['Usuario']
  };

  constructor(private http: HttpClient) {
    // Intenta cargar permisos desde localStorage al iniciar
    this.loadPermissionsFromStorage();
  }

  private loadPermissionsFromStorage(): void {
    try {
      const storedPermissions = localStorage.getItem('user_permissions');
      if (storedPermissions) {
        const parsedPermissions = JSON.parse(storedPermissions) as PermissionResponse;
        this.permissionsSubject.next(parsedPermissions);
        console.log('🔑 Permisos AvisOnline cargados desde localStorage.');
      }
    } catch (e) {
      console.error('❌ Error al cargar permisos desde localStorage:', e);
      // Si hay un error, usar valores por defecto
      this.permissionsSubject.next(this.defaultPermissions);
    }
  }

  loadUserPermissions(): Observable<PermissionResponse> {
    console.log('🔄 Cargando permisos del usuario desde el servidor...');
    
    // Verificar si hay un token antes de hacer la solicitud
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No hay token disponible, usando permisos por defecto');
      this.permissionsSubject.next(this.defaultPermissions);
      return of(this.defaultPermissions);
    }
    
    return this.http.post<PermissionResponse>(`${URL_SERVICIOS}/auth/permissions`, {})
      .pipe(
        tap(response => {
          console.log('✅ Permisos AvisOnline recibidos del servidor.');
          this.permissionsSubject.next(response);
          localStorage.setItem('user_permissions', JSON.stringify(response));
          
          // Limpiar el conjunto de permisos y roles ya registrados
          this.permissionsLogged.clear();
          this.rolesLogged.clear();
        }),
        catchError(error => {
          console.error('❌ Error al cargar permisos:', error);
          
          // En caso de error, usar valores por defecto para que la UI no se bloquee
          this.permissionsSubject.next(this.defaultPermissions);
          return of(this.defaultPermissions);
        })
      );
  }

  /**
   * Verificar si el usuario tiene un permiso específico
   */
  hasPermission(permission: string): boolean {
    const permissions = this.permissionsSubject.value;
    if (!permissions) {
      const storedPermissions = localStorage.getItem('user_permissions');
      if (storedPermissions) {
        try {
          const parsedPermissions = JSON.parse(storedPermissions) as PermissionResponse;
          const hasPermission = parsedPermissions.permissions[permission] || false;
          
          // Registrar el permiso solo una vez por sesión
          if (!this.permissionsLogged.has(permission)) {
            this.permissionsLogged.add(permission);
            console.log(`🔍 Permiso ${permission}: ${hasPermission}`);
          }
          
          return hasPermission;
        } catch (e) {
          console.error('❌ Error al leer permisos:', e);
          return false; // Por defecto denegar para seguridad
        }
      }
      
      // Log solo una vez por permiso
      if (!this.permissionsLogged.has(permission)) {
        this.permissionsLogged.add(permission);
        console.log(`⚠️ No hay permisos guardados, por defecto: false para ${permission}`);
      }
      
      return false; // Por defecto denegar para seguridad
    }
    
    const hasPermission = permissions.permissions[permission] || false;
    
    // Log solo una vez por permiso
    if (!this.permissionsLogged.has(permission)) {
      this.permissionsLogged.add(permission);
      console.log(`🔍 Permiso ${permission}: ${hasPermission}`);
    }
    
    return hasPermission;
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const permissions = this.permissionsSubject.value;
    if (!permissions) {
      const storedPermissions = localStorage.getItem('user_permissions');
      if (storedPermissions) {
        try {
          const parsedPermissions = JSON.parse(storedPermissions) as PermissionResponse;
          const hasRole = parsedPermissions.roles.includes(role);
          
          // Log solo una vez por rol
          if (!this.rolesLogged.has(role)) {
            this.rolesLogged.add(role);
            console.log(`👤 Rol ${role}: ${hasRole}`);
          }
          
          return hasRole;
        } catch (e) {
          console.error('❌ Error al leer roles:', e);
          return false; // Por defecto denegar para seguridad
        }
      }
      
      // Log solo una vez por rol
      if (!this.rolesLogged.has(role)) {
        this.rolesLogged.add(role);
        console.log(`⚠️ No hay roles guardados, por defecto: false para ${role}`);
      }
      
      return false; // Por defecto denegar para seguridad
    }
    
    const hasRole = permissions.roles.includes(role);
    
    // Log solo una vez por rol
    if (!this.rolesLogged.has(role)) {
      this.rolesLogged.add(role);
      console.log(`👤 Rol ${role}: ${hasRole}`);
    }
    
    return hasRole;
  }

  /**
   * Verificar si el usuario tiene al menos uno de los permisos de la lista
   */
  hasAnyPermission(permissionList: string[]): boolean {
    if (!permissionList || permissionList.length === 0) {
      return false;
    }
    
    // Registrar esta verificación solo una vez
    const permissionKey = permissionList.join('|');
    if (!this.permissionsLogged.has(permissionKey)) {
      this.permissionsLogged.add(permissionKey);
      console.log(`🔍 Verificando permisos múltiples: ${permissionKey}`);
    }
    
    // Primero verificamos si el usuario es Admin o tiene full-admin
    if (this.hasRole('Admin') || this.hasPermission('full-admin')) {
      return true;
    }
    
    // Verificar si tiene al menos uno de los permisos de la lista
    return permissionList.some(permission => this.hasPermission(permission));
  }

  /**
   * Verificar si el usuario es super administrador
   */
  isFullAdmin(): boolean {
    return this.hasPermission('full-admin') || this.hasRole('Admin');
  }

  /**
   * Verificar si el usuario puede gestionar usuarios
   */
  canManageUsers(): boolean {
    return this.hasPermission('full-admin') || this.hasPermission('manage-users');
  }

  /**
   * Verificar si el usuario puede gestionar todos los anuncios
   */
  canManageAllAnnouncements(): boolean {
    return this.hasPermission('full-admin') || this.hasPermission('manage-all-announcements');
  }

  /**
   * Verificar si el usuario solo puede gestionar sus propios anuncios
   */
  canManageOwnAnnouncementsOnly(): boolean {
    return this.hasPermission('manage-own-announcements') && 
           !this.hasPermission('manage-all-announcements') && 
           !this.hasPermission('full-admin');
  }

  /**
   * Verificar si el usuario puede gestionar categorías
   */
  canManageCategories(): boolean {
    return this.hasPermission('full-admin') || this.hasPermission('manage-categories');
  }

  /**
   * Verificar si el usuario puede gestionar sliders
   */
  canManageSliders(): boolean {
    return this.hasPermission('full-admin') || this.hasPermission('manage-sliders');
  }

  /**
   * Obtener el tipo de usuario basado en sus permisos
   */
  getUserType(): string {
    if (this.hasPermission('full-admin')) {
      return 'super_admin';
    }
    if (this.hasRole('Admin') || 
        this.hasPermission('manage-users') || 
        this.hasPermission('manage-all-announcements')) {
      return 'admin';
    }
    return 'user';
  }

  /**
   * Limpiar permisos del localStorage y memoria
   */
  clearPermissions(): void {
    localStorage.removeItem('user_permissions');
    this.permissionsSubject.next(null);
    this.permissionsLogged.clear();
    this.rolesLogged.clear();
    console.log('🧹 Permisos limpiados');
  }

  /**
   * Obtener información de permisos para debugging
   */
  getPermissionInfo(): any {
    const permissions = this.permissionsSubject.value;
    return {
      currentPermissions: permissions,
      userType: this.getUserType(),
      isFullAdmin: this.isFullAdmin(),
      canManageUsers: this.canManageUsers(),
      canManageAllAnnouncements: this.canManageAllAnnouncements(),
      canManageOwnAnnouncementsOnly: this.canManageOwnAnnouncementsOnly(),
      canManageCategories: this.canManageCategories(),
      canManageSliders: this.canManageSliders()
    };
  }
} 