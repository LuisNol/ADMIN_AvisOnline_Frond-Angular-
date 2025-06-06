// src/app/modules/auth/auth-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthComponent } from './auth.component';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { LogoutComponent } from './components/logout/logout.component';
import { GoogleCallbackComponent } from './components/google-callback/google-callback.component';

const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      // Si la ruta es exactamente "/auth", redirige a "/auth/login"
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },

      // Rutas solicitadas:
      {
        path: 'login',
        component: LoginComponent,
        data: { returnUrl: window.location.pathname },
      },
      {
        path: 'signup',            // Alias “signup” para el componente de registro
        component: RegistrationComponent,
      },
      {
        path: 'google/callback',   // Ruta para el callback de Google
        component: GoogleCallbackComponent,
      },

      // Rutas adicionales que ya tenías:
      {
        path: 'registration',      // Equivalente a “signup”, si prefieres esta URL también
        component: RegistrationComponent,
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
      },
      {
        path: 'logout',
        component: LogoutComponent,
      },

      // Si no coincide ninguna de las anteriores, redirige a "/auth/login"
      {
        path: '**',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
