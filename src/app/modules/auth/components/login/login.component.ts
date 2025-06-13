import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { first, finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionService } from '../../services/permission.service';
import { AuthGoogleService } from '../../../../auth-google.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  defaultAuth: any = {
    email: '',
    password: '',
  };

  loginForm: FormGroup;
  hasError: boolean = false;
  isLoading: boolean = false;
  isLoading$: Observable<boolean>;
  returnUrl: string;
  showPassword: boolean = false;

  private unsubscribe: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private permissionService: PermissionService,
    private authGoogleService: AuthGoogleService
  ) {
    this.isLoading$ = this.authService.isLoading$;

    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.initForm();
    // get return url from route parameters or default to '/'
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'.toString()] || '/';
      
    // Verificar si hay errores de Google en los query params
    const googleError = this.route.snapshot.queryParams['googleError'];
    if (googleError) {
      this.hasError = true;
      console.error('Error de autenticación con Google:', googleError);
    }
  }

  get f() {
    return this.loginForm.controls;
  }

  initForm() {
    this.loginForm = this.fb.group({
      email: [
        this.defaultAuth.email,
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.minLength(3),
          Validators.maxLength(320),
        ]),
      ],
      password: [
        this.defaultAuth.password,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ]),
      ],
      rememberMe: [false],
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Método login agregado para Google Auth
  login() {
    this.authGoogleService.login();
  }

  // Método para mostrar datos de Google (opcional, para debugging)
  showData() {
    const data = JSON.stringify(this.authGoogleService.getProfile());
    console.log(data);
  }

  // Método para logout de Google (opcional)
  logOut() {
    this.authGoogleService.logout();
    this.router.navigate(['login']);
  }

  signInWithGoogle() {
    // Ahora usa el servicio de Google Auth
    this.login();
  }

  submit() {
    this.hasError = false;
    this.isLoading = true;

    const loginSubscr = this.authService
      .login(this.f.email.value, this.f.password.value)
      .pipe(
        first(),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((user: any) => {
        if (user) {
          this.loadPermissionsAndNavigate();
        } else {
          this.hasError = true;
        }
      });

    this.unsubscribe.push(loginSubscr);
  }

  loadPermissionsAndNavigate() {
    this.permissionService.loadUserPermissions().subscribe(
      (permissions) => {
        console.log('Permisos cargados después del login:', permissions);
        window.location.href = this.returnUrl;
      },
      (error) => {
        console.error('Error al cargar permisos después del login:', error);
        window.location.href = this.returnUrl;
      }
    );
  }
  
  /** Método para iniciar sesión con Google */
  loginWithGoogle() {
    this.authGoogleService.login();
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}