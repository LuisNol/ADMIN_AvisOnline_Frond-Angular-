// src/app/main/main.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthGoogleService } from '../auth-google.service';
import { AuthService } from '../modules/auth/services/auth.service';
import { first, switchMap } from 'rxjs/operators';
import { UserModel } from '../modules/auth/models/user.model';


@Component({
  selector: 'app-main',
  template: `
    <div class="d-flex flex-column justify-content-center align-items-center" style="height: 80vh;">
      <div class="text-center mb-5">
        <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google" class="mb-3">
        <h4 class="text-gray-800 fw-bold">Procesando autenticación con Google</h4>
        <p class="text-muted">Por favor espera mientras te autenticamos...</p>
      </div>
      
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      
      <div class="mt-5">
        <small class="text-muted">Si esto toma demasiado tiempo, 
          <a href="/auth/login" class="text-primary">haz clic aquí para volver al login</a>
        </small>
      </div>
    </div>
  `
})
export class MainComponent implements OnInit {

  constructor(
    private authGoogle: AuthGoogleService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1. Intentar "parsear" el hash (callback) que Google puso en la URL
    this.authGoogle.oauthService.loadDiscoveryDocumentAndTryLogin()
      .then(() => {
        // 2. Una vez que OAuthService haya consumido el hash y almacenado tokens en memory,
        //    llamamos a storeCredentials() para guardarlo en localStorage.
        const ok = this.authGoogle.storeCredentials();
        if (!ok) {
          // Si no logró extraer el perfil y token, redirijo a registro manual
          this.router.navigate(['/auth/registration']);
          return;
        }

        // 3. Obtengo el perfil de Google recién guardado
        const profile: any = this.authGoogle.getProfile();
        if (!profile) {
          this.router.navigate(['/auth/registration']);
          return;
        }

        // 4. Armo el UserModel a partir del perfil de Google
        const newUser = new UserModel();
        newUser.setUser({
          name: profile.name,
          email: profile.email,
          password: '' // el back-end decide si lo ignora
        });

        // 5. Obtener un ID token válido (refrescándolo si es necesario) y luego llamar al backend
        this.authGoogle.getValidIdToken()
          .pipe(
            switchMap((idToken) => {
              if (!idToken) {
                throw new Error('No se pudo obtener un token válido de Google');
              }
              console.log('🔑 Enviando token válido al backend...');
              return this.authService.loginWithGoogle(idToken);
            }),
            first()
          )
          .subscribe(
            (logeado) => {
              if (logeado) {
                console.log('✅ Usuario autenticado exitosamente con Google');
                // usuario logueado correctamente (o registrado+logueado)
                // Usar window.location.href para forzar recarga completa y aplicar permisos
                window.location.href = '/';
              } else {
                // Si el backend devuelve error o usuario no se crea,
                // lo mando a login con mensaje
                this.router.navigate(['/auth/login'], {
                  queryParams: { googleError: 'No se pudo autenticar con Google' }
                });
              }
            },
            (err) => {
              console.error('❌ Error backend Google login:', err);
              
              // Si el error es específicamente de token expirado, intentar un refresh forzado
              if (err.status === 401 || err.error?.error?.includes('Token') || err.error?.error?.includes('expired')) {
                console.log('🔄 Intentando refresh forzado del token...');
                this.authGoogle.forceRefreshToken().subscribe(
                  (refreshSuccess) => {
                    if (refreshSuccess) {
                      console.log('✅ Token refrescado, reintentando login...');
                      // Reintentar el login con el token refrescado
                      const newIdToken = this.authGoogle.getIdToken();
                      this.authService.loginWithGoogle(newIdToken)
                        .pipe(first())
                        .subscribe(
                          (retryLogeado) => {
                            if (retryLogeado) {
                              console.log('✅ Login exitoso después del refresh');
                              window.location.href = '/';
                            } else {
                              this.handleLoginError('Falló el reintento después del refresh');
                            }
                          },
                          (retryErr) => {
                            console.error('❌ Error en reintento después del refresh:', retryErr);
                            this.handleLoginError('Error en reintento después del refresh');
                          }
                        );
                    } else {
                      this.handleLoginError('No se pudo refrescar el token de Google');
                    }
                  }
                );
              } else {
                this.handleLoginError('Error en servidor al validar token de Google');
              }
            }
          );
      })
      .catch(err => {
        console.error('Error al cargar DiscoveryDocument/tryLogin:', err);
        this.router.navigate(['/auth/login']);
      });
  }

  private handleLoginError(message: string) {
    this.router.navigate(['/auth/login'], {
      queryParams: { googleError: message }
    });
  }
}
