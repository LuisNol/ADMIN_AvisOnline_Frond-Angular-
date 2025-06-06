import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent }           from './auth.component';
import { LoginComponent }          from './components/login/login.component';
import { RegistrationComponent }   from './components/registration/registration.component';
import { MainComponent } from 'src/app/main/main.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { LogoutComponent }         from './components/logout/logout.component';

@NgModule({
  declarations: [
    AuthComponent,
    LoginComponent,
    RegistrationComponent,
    ForgotPasswordComponent,
    LogoutComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthRoutingModule
  ]
})
export class AuthModule {}
