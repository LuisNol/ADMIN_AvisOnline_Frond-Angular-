import { Injectable } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc'

@Injectable({
  providedIn: 'root'
})
export class AuthGoogleService {

  constructor(private oauthService: OAuthService) {
    this.initLogin();
  }

  initLogin() {
    const config: AuthConfig = {
      issuer: 'https://accounts.google.com',
      strictDiscoveryDocumentValidation: false,
      clientId: '659951375693-9d3f97voqatunl9n0mhdmcbn3jbssttt.apps.googleusercontent.com',
      redirectUri: window.location.origin + '/auth/main',
      postLogoutRedirectUri: window.location.origin + '/auth/login',
      scope: 'openid profile email',
    }

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
  }

  getProfile() {
    return this.oauthService.getIdentityClaims();
  }

}
