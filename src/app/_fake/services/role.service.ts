import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { IPermissionModel } from './permission.service';
import { IUserModel } from './user-service';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/modules/auth';
export interface DataTablesResponse {
  draw?: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: any[];
}

export interface IRoleModel {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  permissions: IPermissionModel[];
  users: IUserModel[];
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  //private apiUrl = 'https://preview.keenthemes.com/starterkit/metronic/laravel/api/v1/roles';
   private apiUrl = `${URL_SERVICIOS}/admin/roles`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }
  
  private getHeaders(): HttpHeaders {
    const token = this.authService.token || localStorage.getItem('token');
    if (!token) {
      console.warn('No hay token disponible para roles');
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }
    
    return new HttpHeaders({
      'Authorization': 'Bearer ' + token,
      'X-User-Permission': 'manage-users',
      'Content-Type': 'application/json'
    });
  }
  
  private handleError = (error: any) => {
    console.error('Error en API de roles:', error);
    if (error.status === 403) {
      console.error('Error de permisos para gestión de roles');
    }
    return throwError(() => error);
  }

  getUsers(id: number, dataTablesParameters: any): Observable<DataTablesResponse> {
    const url = `${this.apiUrl}/${id}/users`;
    const headers = this.getHeaders();
    return this.http.post<DataTablesResponse>(url, dataTablesParameters, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getRoles(dataTablesParameters?: any): Observable<DataTablesResponse> {
    const url = `${this.apiUrl}-list`;
    const headers = this.getHeaders();
    return this.http.post<DataTablesResponse>(url, dataTablesParameters, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getRole(id: number): Observable<IRoleModel> {
    const url = `${this.apiUrl}/${id}`;
    const headers = this.getHeaders();
    return this.http.get<IRoleModel>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  createRole(user: IRoleModel): Observable<IRoleModel> {
    const headers = this.getHeaders();
    return this.http.post<IRoleModel>(this.apiUrl, user, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  updateRole(id: number, user: IRoleModel): Observable<IRoleModel> {
    const url = `${this.apiUrl}/${id}`;
    const headers = this.getHeaders();
    return this.http.put<IRoleModel>(url, user, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  deleteRole(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    const headers = this.getHeaders();
    return this.http.delete<void>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  deleteUser(role_id: number, user_id: number): Observable<void> {
    const url = `${this.apiUrl}/${role_id}/users/${user_id}`;
    const headers = this.getHeaders();
    return this.http.delete<void>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }
}
