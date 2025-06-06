import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthGoogleService } from '../auth-google.service';
import { AuthService } from '../modules/auth/services/auth.service';
import { PermissionService } from '../modules/auth/services/permission.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor(
    private authGoogleService: AuthGoogleService,
    private authService: AuthService,
    private permissionService: PermissionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // 1) Intentamos guardar las credenciales de Google en localStorage
    const stored = this.authGoogleService.storeCredentials();

    if (stored) {
      // 2) Si existía un token de Google válido, lo recuperamos
      const idToken = this.authGoogleService.getIdToken();

      // 3) Llamamos al backend para que valide el ID token y nos devuelva
      //    un token de nuestra propia API (por ejemplo, con Sanctum o JWT).
      this.authService.loginWithGoogle(idToken).subscribe({
        next: () => {
          // 4) Una vez logueado, cargamos permisos y redirigimos a /dashboard
          this.permissionService.loadUserPermissions().subscribe(
            () => this.router.navigate(['/dashboard']),
            () => this.router.navigate(['/dashboard'])
          );
        },
        error: () => {
          // Si algo falla (token inválido, expirado, etc.) volvemos al login
          this.router.navigate(['/auth/login']);
        }
      });
    } else {
      // No había credenciales de Google, mandamos al usuario a /auth/login
      this.router.navigate(['/auth/login']);
    }
  }

  showData(): void {
    const data = JSON.stringify(this.authGoogleService.getProfile());
    console.log(data);
  }

  logOut(): void {
    this.authGoogleService.logout();
    this.router.navigate(['/login']);
  }

}
