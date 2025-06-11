// src/app/main/main.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthGoogleService } from '../auth-google.service';
import { AuthService } from '../modules/auth/services/auth.service';
import { first } from 'rxjs/operators';
import { UserModel } from '../modules/auth/models/user.model';


@Component({
  selector: 'app-main',
  template: `
    <div class="d-flex justify-content-center align-items-center" style="height: 80vh;">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Cargando...</span>
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
    // 1. Intentar “parsear” el hash (callback) que Google puso en la URL
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

        // 5. Llamo al endpoint de “loginWithGoogle”: backend debe recibir id_token
        const idToken = this.authGoogle.getIdToken();
        this.authService.loginWithGoogle(idToken)
          .pipe(first())
          .subscribe(
            (logeado) => {
              if (logeado) {
                // usuario logueado correctamente (o registrado+logueado)
                this.router.navigate(['/']);
              } else {
                // Si el backend devuelve error o usuario no se crea,
                // lo mando a login con mensaje
                this.router.navigate(['/auth/login'], {
                  queryParams: { googleError: 'No se pudo autenticar con Google' }
                });
              }
            },
            (err) => {
              console.error('Error backend Google login:', err);
              this.router.navigate(['/auth/login'], {
                queryParams: { googleError: 'Error en servidor al validar token de Google' }
              });
            }
          );
      })
      .catch(err => {
        console.error('Error al cargar DiscoveryDocument/tryLogin:', err);
        this.router.navigate(['/auth/login']);
      });
  }
}
