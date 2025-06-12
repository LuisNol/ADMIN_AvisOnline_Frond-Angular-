import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ConfirmPasswordValidator } from './confirm-password.validator';
import { UserModel } from '../../models/user.model';
import { first } from 'rxjs/operators';
import { AuthGoogleService } from '../../../../auth-google.service';
import { CustomValidators } from '../../../../shared/validators/custom-validators';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit, OnDestroy {
  registrationForm: FormGroup;
  hasError: boolean = false;
  registrationSuccess: boolean = false;
  isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();

  private unsubscribe: Subscription[] = [];

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private authGoogleService: AuthGoogleService
  ) {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  login() {
    this.authGoogleService.login();
  }

  showData() {
    const data = JSON.stringify(this.authGoogleService.getProfile());
    console.log(data);
  }

  logOut() {
    this.authGoogleService.logout();
    this.router.navigate(['login']);
  }

  ngOnInit(): void {
    this.initForm();
  }

  get f() {
    return this.registrationForm.controls;
  }

  private initForm(): void {
    this.registrationForm = this.fb.group(
      {
        name: ['', [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          CustomValidators.nameValidator()
        ]],
        email: ['', [
          Validators.required,
          Validators.email,
          Validators.minLength(3),
          Validators.maxLength(320)
        ]],
        password: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(100),
          CustomValidators.strongPasswordValidator()
        ]],
        cPassword: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(100),
          CustomValidators.confirmPasswordValidator('password')
        ]],
        agree: [false, Validators.requiredTrue]
      },
      {
        validator: ConfirmPasswordValidator.MatchPassword
      }
    );

    this.registrationForm.get('password')?.valueChanges.subscribe(() => {
      this.registrationForm.get('cPassword')?.updateValueAndValidity();
    });
  }

  submit(): void {
    this.hasError = false;
    this.registrationSuccess = false;

    if (this.registrationForm.valid) {
      this.isLoadingSubject.next(true); // inicia carga

      const result: { [key: string]: string } = {};
      Object.keys(this.f).forEach((key) => {
        result[key] = this.f[key].value;
      });

      const newUser = new UserModel();
      newUser.setUser({
        name: result.name,
        email: result.email,
        password: result.password,
      });

      const registrationSubscr = this.authService
        .registration(newUser)
        .pipe(first())
        .subscribe({
          next: (user: UserModel) => {
            this.isLoadingSubject.next(false); // fin de carga
            if (user) {
              this.registrationSuccess = true;
              setTimeout(() => {
                this.router.navigate(['/']);
              }, 2000);
            } else {
              this.hasError = true;
            }
          },
          error: () => {
            this.isLoadingSubject.next(false); // error = fin de carga
            this.hasError = true;
          }
        });

      this.unsubscribe.push(registrationSubscr);
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registrationForm.controls).forEach(key => {
      const control = this.registrationForm.get(key);
      control?.markAsTouched();
    });
  }

  getNameErrorMessage(): string {
    const nameControl = this.registrationForm.get('name');
    if (nameControl?.hasError('required')) return 'El nombre es obligatorio';
    if (nameControl?.hasError('minlength')) return 'El nombre debe tener al menos 3 caracteres';
    if (nameControl?.hasError('maxLength')) return 'El nombre no debe exceder los 100 caracteres';
    if (nameControl?.hasError('invalidName')) return 'El nombre solo debe contener letras y espacios';
    if (nameControl?.hasError('onlySpaces')) return 'El nombre no puede contener solo espacios';
    return '';
  }

  getPasswordErrorMessage(): string {
    const passwordControl = this.registrationForm.get('password');
    if (passwordControl?.hasError('required')) return 'La contraseña es obligatoria';
    if (passwordControl?.hasError('minLength')) return 'La contraseña debe tener al menos 8 caracteres';
    if (passwordControl?.hasError('maxLength')) return 'La contraseña no debe exceder los 100 caracteres';
    if (passwordControl?.hasError('noLowercase')) return 'Debe contener al menos una letra minúscula';
    if (passwordControl?.hasError('noUppercase')) return 'Debe contener al menos una letra mayúscula';
    if (passwordControl?.hasError('noNumber')) return 'Debe contener al menos un número';
    if (passwordControl?.hasError('noSpecialChar')) return 'Debe contener al menos un carácter especial (!@#$%^&*...)';
    if (passwordControl?.hasError('commonPassword')) return 'Esta contraseña es muy común';
    if (passwordControl?.hasError('simplePattern')) return 'Evita secuencias simples como 1234, abcd, etc.';
    return '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
