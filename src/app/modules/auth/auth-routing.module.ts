import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { LogoutComponent } from './components/logout/logout.component';
import { MainComponent } from './../../main/main.component';

const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      // 1. Redireccionar ruta vacía a 'login'
      { path: '', redirectTo: 'login', pathMatch: 'full' },

      // 2. Rutas de autenticación
      { path: 'login', component: LoginComponent },
      { path: 'registration', component: RegistrationComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'logout', component: LogoutComponent },

      // 3. Ruta específica para el callback de Google (MainComponent)
      { path: 'main', component: MainComponent },

      // 4. Wildcard para todo lo demás: redirige a 'login'
      { path: '**', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
