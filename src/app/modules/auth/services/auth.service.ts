// src/app/modules/auth/services/auth.service.ts

import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { map, catchError, switchMap, finalize, tap } from 'rxjs/operators'; // añadimos tap
import { UserModel } from '../models/user.model';
import { AuthHTTPService } from './auth-http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICIOS } from 'src/app/config/config';
import { PermissionService } from 'src/app/modules/auth/services/permission.service'; // ¡IMPORTANTE!

export type UserType = UserModel | undefined;

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  // private fields
  private unsubscribe: Subscription[] = [];
  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;

  // public fields
  currentUser$: Observable<UserType>;
  isLoading$: Observable<boolean>;
  currentUserSubject: BehaviorSubject<UserType>;
  isLoadingSubject: BehaviorSubject<boolean>;

  get currentUserValue(): UserType {
    return this.currentUserSubject.value;
  }

  set currentUserValue(user: UserType) {
    this.currentUserSubject.next(user);
  }

  user: any = null;
  token: any = null;

  constructor(
    private authHttpService: AuthHTTPService,
    private router: Router,
    private http: HttpClient,
    private permissionService: PermissionService // Inyectamos PermissionService
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<UserType>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable();

    const subscr = this.getUserByToken().subscribe();
    this.unsubscribe.push(subscr);
  }

  // ------------------------------------------------------------
  // LOGIN CON EMAIL/PASSWORD
  // ------------------------------------------------------------
  login(email: string, password: string): Observable<boolean|undefined> {
    this.isLoadingSubject.next(true);
    return this.http.post(`${URL_SERVICIOS}/auth/login`, { email, password }).pipe(
      tap((auth: any) => {
        // 1) Guardamos token y user
        const ok = this.setAuthFromLocalStorage(auth);
        if (ok) {
          // 2) Recargamos permisos
          this.permissionService.loadUserPermissions().subscribe();
        }
      }),
      map((auth: any) => !!(auth && auth.access_token)),
      catchError((err) => {
        console.error('err', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  // ------------------------------------------------------------
  // LOGIN O REGISTRO CON GOOGLE (ID TOKEN)
  // ------------------------------------------------------------
  loginWithGoogle(idToken: string): Observable<boolean|undefined> {
    this.isLoadingSubject.next(true);
    return this.http
      .post(`${URL_SERVICIOS}/auth/google_login`, { id_token: idToken }) // backend espera id_token
      .pipe(
        tap((auth: any) => {
          // 1) Guardar token y user
          const ok = this.setAuthFromLocalStorage(auth);
          if (ok) {
            // 2) Recargamos permisos
            this.permissionService.loadUserPermissions().subscribe();
          }
        }),
        map((auth: any) => !!(auth && auth.access_token)),
        catchError((err) => {
          console.error('err', err);
          return of(undefined);
        }),
        finalize(() => this.isLoadingSubject.next(false))
      );
  }

  // ------------------------------------------------------------
  // REGISTRO (EMAIL + PASSWORD)
  // ------------------------------------------------------------
  registration(user: UserModel): Observable<any> {
    this.isLoadingSubject.next(true);
    return this.authHttpService.createUser(user).pipe(
      tap(() => this.isLoadingSubject.next(false)),
      switchMap(() => this.login(user.email, user.password)),
      catchError((err) => {
        console.error('err', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  // ------------------------------------------------------------
  // FORGOT PASSWORD
  // ------------------------------------------------------------
  forgotPassword(email: string): Observable<boolean> {
    this.isLoadingSubject.next(true);
    return this.authHttpService
      .forgotPassword(email)
      .pipe(finalize(() => this.isLoadingSubject.next(false)));
  }

  // ------------------------------------------------------------
  // LOGOUT
  // ------------------------------------------------------------
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user_permissions');
    // Limpiamos permisos en el servicio
    this.permissionService.clearPermissions();
    this.currentUserSubject.next(undefined);
    this.router.navigate(['/auth/login'], {
      queryParams: {},
    });
  }

  // ------------------------------------------------------------
  // INTENTA LEER USUARIO DESDE LOCALSTORAGE AL INICIAR APP
  // ------------------------------------------------------------
  getUserByToken(): Observable<any> {
    const auth = this.getAuthFromLocalStorage();
    if (!auth) {
      return of(undefined);
    }

    this.isLoadingSubject.next(true);
    return of(auth).pipe(
      tap((user: any) => {
        if (user) {
          this.currentUserSubject.next(user);
          // Cargar permisos al iniciar la app si hay usuario
          this.permissionService.loadUserPermissions().subscribe();
        } else {
          this.logout();
        }
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  // ------------------------------------------------------------
  // MÉTODOS PRIVADOS DE UTILIDAD
  // ------------------------------------------------------------
  private setAuthFromLocalStorage(auth: any): boolean {
    if (auth && auth.access_token) {
      localStorage.setItem('user', JSON.stringify(auth.user));
      localStorage.setItem('token', auth.access_token);
      this.currentUserSubject.next(auth.user);
      return true;
    }
    return false;
  }

  private getAuthFromLocalStorage(): any | undefined {
    try {
      const lsValue = localStorage.getItem('user');
      if (!lsValue) {
        return undefined;
      }
      this.token = localStorage.getItem('token');
      this.user = JSON.parse(lsValue);
      return this.user;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
