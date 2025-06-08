import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/modules/auth';

export interface DataTablesResponse {
  draw?: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: any[];
}

export interface IPermissionModel {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  private apiUrl = `${URL_SERVICIOS}/admin/permissions`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }
  
  private getHeaders(): HttpHeaders {
    const token = this.authService.token || localStorage.getItem('token');
    if (!token) {
      console.warn('No hay token disponible para permisos');
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
    console.error('Error en API de permisos:', error);
    if (error.status === 403) {
      console.error('Error de permisos para gestión de permisos');
    }
    return throwError(() => error);
  }

  getPermissions(dataTablesParameters: any): Observable<DataTablesResponse> {
    const url = `${this.apiUrl}-list`;
    const headers = this.getHeaders();
    return this.http.post<DataTablesResponse>(url, dataTablesParameters, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getPermission(id: number): Observable<IPermissionModel> {
    const url = `${this.apiUrl}/${id}`;
    const headers = this.getHeaders();
    return this.http.get<IPermissionModel>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  createPermission(user: IPermissionModel): Observable<IPermissionModel> {
    const headers = this.getHeaders();
    return this.http.post<IPermissionModel>(this.apiUrl, user, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  updatePermission(id: number, user: IPermissionModel): Observable<IPermissionModel> {
    const url = `${this.apiUrl}/${id}`;
    const headers = this.getHeaders();
    return this.http.put<IPermissionModel>(url, user, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  deletePermission(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    const headers = this.getHeaders();
    return this.http.delete<void>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }
}
