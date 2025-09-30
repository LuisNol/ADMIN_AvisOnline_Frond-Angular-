import { Injectable } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { Observable, from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGoogleService {

  constructor(public oauthService: OAuthService) {
    this.initLogin();
  }

  initLogin() {
    const config: AuthConfig = {
      issuer: 'https://accounts.google.com',
      strictDiscoveryDocumentValidation: false,
      clientId: '617926044385-lrg4er3dv9cd48nb6bf3t8gl3hl2p88v.apps.googleusercontent.com', // TU NUEVO CLIENT_ID
      
      // URLs de producción (TU CONFIGURACIÓN)
      //redirectUri: 'https://www.admin.avisonline.store/auth/main',
      //postLogoutRedirectUri: 'https://www.admin.avisonline.store/auth/login',
      
      // URLs de desarrollo (para testing local)
      redirectUri: 'http://localhost:5000/auth/main',
      postLogoutRedirectUri: 'http://localhost:5000/auth/login',
      
      scope: 'openid profile email',
      
      // Configuraciones adicionales para refresh automático
      silentRefreshRedirectUri: 'https://www.admin.avisonline.store/silent-refresh.html',
      useSilentRefresh: true,
      silentRefreshTimeout: 5000,
      timeoutFactor: 0.75, // Refrescar cuando quede 25% del tiempo
    };

    this.oauthService.configure(config);
    this.oauthService.setupAutomaticSilentRefresh();
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

  login() {
    this.oauthService.initLoginFlow();
  }

  /**
   * Guarda el token y el perfil de Google en localStorage
   * para integrarlo con el sistema de autenticación existente.
   */
  storeCredentials(): boolean {
    if (this.oauthService.hasValidAccessToken()) {
      const profile: any = this.getProfile();
      if (profile) {
        localStorage.setItem('user', JSON.stringify(profile));
        localStorage.setItem('token', this.oauthService.getAccessToken());
        localStorage.setItem('id_token', this.oauthService.getIdToken());
        return true;
      }
    }
    return false;
  }

  logout() {
    this.oauthService.revokeTokenAndLogout();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user_permissions');
    localStorage.removeItem('id_token');
  }

  getProfile() {
    return this.oauthService.getIdentityClaims();
  }

  /** Devuelve el access token crudo de Google */
  getAccessToken(): string {
    return this.oauthService.getAccessToken();
  }

  /** Devuelve el ID token de Google */
  getIdToken(): string {
    return this.oauthService.getIdToken();
  }

  /**
   * Verifica si el token actual es válido y no está expirado
   */
  isTokenValid(): boolean {
    return this.oauthService.hasValidIdToken() && this.oauthService.hasValidAccessToken();
  }

  /**
   * Obtiene un ID token válido, refrescándolo si es necesario
   */
  getValidIdToken(): Observable<string | null> {
    // Si el token actual es válido, lo devolvemos
    if (this.isTokenValid()) {
      const idToken = this.getIdToken();
      if (idToken) {
        console.log('✅ Token de Google válido, usando token actual');
        return of(idToken);
      }
    }

    console.log('⚠️ Token de Google expirado o inválido, intentando refrescar...');
    
    // Intentar refresh silencioso
    return from(this.oauthService.silentRefresh()).pipe(
      map(() => {
        if (this.isTokenValid()) {
          const refreshedToken = this.getIdToken();
          console.log('✅ Token de Google refrescado exitosamente');
          // Actualizar localStorage con el nuevo token
          localStorage.setItem('id_token', refreshedToken);
          return refreshedToken;
        }
        throw new Error('No se pudo refrescar el token');
      }),
      catchError((error) => {
        console.error('❌ Error al refrescar token de Google:', error);
        return of(null);
      })
    );
  }

  /**
   * Fuerza un refresh del token
   */
  forceRefreshToken(): Observable<boolean> {
    return from(this.oauthService.silentRefresh()).pipe(
      map(() => {
        const success = this.isTokenValid();
        if (success) {
          this.storeCredentials(); // Actualizar localStorage
          console.log('✅ Token refrescado y guardado exitosamente');
        }
        return success;
      }),
      catchError((error) => {
        console.error('❌ Error al forzar refresh del token:', error);
        return of(false);
      })
    );
  }

  /**
   * Verifica si el usuario tiene una sesión activa con Google
   */
  hasActiveSession(): boolean {
    return this.oauthService.hasValidAccessToken() && this.oauthService.hasValidIdToken();
  }

  /**
   * Intenta restaurar la sesión desde localStorage o refresh silencioso
   */
  tryRestoreSession(): Observable<boolean> {
    // Primero verificar si ya tenemos tokens válidos
    if (this.hasActiveSession()) {
      console.log('✅ Sesión de Google ya activa');
      return of(true);
    }

    // Intentar cargar desde discovery document y hacer login silencioso
    return from(this.oauthService.loadDiscoveryDocumentAndTryLogin()).pipe(
      switchMap(() => {
        if (this.hasActiveSession()) {
          console.log('✅ Sesión restaurada desde discovery document');
          return of(true);
        }
        
        // Si no funciona, intentar refresh silencioso
        console.log('🔄 Intentando refresh silencioso...');
        return from(this.oauthService.silentRefresh()).pipe(
          map(() => {
            const success = this.hasActiveSession();
            if (success) {
              console.log('✅ Sesión restaurada con refresh silencioso');
              this.storeCredentials();
            }
            return success;
          }),
          catchError(() => {
            console.log('❌ No se pudo restaurar la sesión de Google');
            return of(false);
          })
        );
      }),
      catchError(() => {
        console.log('❌ Error al cargar discovery document');
        return of(false);
      })
    );
  }
}
