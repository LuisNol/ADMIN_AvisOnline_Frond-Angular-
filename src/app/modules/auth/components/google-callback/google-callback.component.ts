// src/app/modules/auth/components/google-callback/google-callback.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthGoogleService } from '../../../../auth-google.service';

@Component({
  selector: 'app-google-callback',
  template: `
    <div class="d-flex justify-content-center align-items-center" style="height:100vh;">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Procesando...</span>
      </div>
    </div>
  `
})
export class GoogleCallbackComponent implements OnInit {

  constructor(
    private authGoogleService: AuthGoogleService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Aquí, OAuth2 ya cargó el id_token en memoria.
    this.authGoogleService.sendTokenToBackend().subscribe({
      next: () => {
        // Si el backend devolvió OK, el JWT ya está en localStorage
        this.router.navigate(['/']);
      },
      error: err => {
        console.error('Error al enviar token de Google al backend:', err);
        // En caso de falla, redirige a login con un parámetro de error
        this.router.navigate(['/auth/login'], { queryParams: { error: 'google_failed' } });
      }
    });
  }
}
