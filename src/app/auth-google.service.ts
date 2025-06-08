import { Injectable } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';

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
      clientId: '659951375693-nq31qci00e9b2lmhh6edevshunrfiduk.apps.googleusercontent.com',
      redirectUri: window.location.origin + '/auth/google/callback',
      scope: 'openid profile email',
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
}
