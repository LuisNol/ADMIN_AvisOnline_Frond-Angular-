// src/app/auth-google.service.ts

import { Injectable } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGoogleService {

  /** La URL completa del endpoint laravel para login/registro con Google */
  private apiUrl = environment.apiUrl + '/auth/google';

  constructor(
    private oauthService: OAuthService,
    private http: HttpClient
  ) {
    this.initLogin();
  }

  /** Configura OAuth2-OIDC para Google */
  private initLogin() {
    const config: AuthConfig = {
      issuer: 'https://accounts.google.com',
      strictDiscoveryDocumentValidation: false,
      clientId: '659951375693-nq31qci00e9b2lmhh6edevshunrfiduk.apps.googleusercontent.com',
      redirectUri: window.location.origin + '/auth/google/callback',
      scope: 'openid profile email',
      responseType: 'id_token', // pedimos únicamente el id_token
    };

    this.oauthService.configure(config);
    this.oauthService.setupAutomaticSilentRefresh();
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

  /** Dispara el flujo de login con Google */
  login() {
    this.oauthService.initImplicitFlow();
  }

  /** Cierra sesión de Google + Angular */
  logout() {
    this.oauthService.logOut();
  }

  /** Devuelve las identityClaims (perfil) que envió Google */
  getIdentityClaims(): any {
    return this.oauthService.getIdentityClaims();
  }

  /** Devuelve el id_token JWT que Google nos devolvió */
  getIdToken(): string | null {
    return this.oauthService.getIdToken();
  }

  /**
   * Envía el id_token al backend (Laravel) para que valide/registre al usuario.
   * El backend responderá con su propio JWT (token del sistema) y datos de usuario.
   */
  sendTokenToBackend() {
    const idToken = this.getIdToken();
    if (!idToken) {
      throw new Error('No se encontró id_token después de autenticarse con Google');
    }
    return this.http.post<any>(this.apiUrl, { id_token: idToken }).pipe(
      tap(response => {
        // Response esperado: { token: 'TU_JWT_DEL_BACKEND', user: { id, name, email, avatar } }
        localStorage.setItem('appToken', response.token);
        localStorage.setItem('appUser', JSON.stringify(response.user));
      })
    );
  }
}
