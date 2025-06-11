import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { IRoleModel } from './role.service';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from 'src/app/modules/auth';

export interface DataTablesResponse {
    draw?: number;
    recordsTotal: number;
    recordsFiltered: number;
    data: any[];
}

export interface IUserModel {
    avatar?: null | string;
    created_at?: string;
    email: string;
    email_verified_at?: string;
    id: number;
    last_login_at?: null | string;
    last_login_ip?: null | string;
    name?: string;
    profile_photo_path?: null | string;
    updated_at?: string;
    password?: string;
    roles?: IRoleModel[];
    role?: string;
    type_user?: string | number;
    surname?: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private apiUrl = `${URL_SERVICIOS}/admin/users`;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }
    
    private getHeaders(): HttpHeaders {
        const token = this.authService.token || localStorage.getItem('token');
        if (!token) {
            console.warn('No hay token disponible para gestión de usuarios');
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
        console.error('Error en API de usuarios:', error);
        if (error.status === 403) {
            console.error('Error de permisos para gestión de usuarios');
        }
        return throwError(() => error);
    }

    getUsers(dataTablesParameters: any): Observable<DataTablesResponse> {
        const url = `${this.apiUrl}-list`;
        const headers = this.getHeaders();
        return this.http.post<DataTablesResponse>(url, dataTablesParameters, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    getUser(id: number): Observable<IUserModel> {
        const url = `${this.apiUrl}/${id}`;
        const headers = this.getHeaders();
        return this.http.get<IUserModel>(url, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    createUser(user: IUserModel): Observable<IUserModel> {
        const headers = this.getHeaders();
        return this.http.post<IUserModel>(this.apiUrl, user, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    updateUser(id: number, user: IUserModel): Observable<IUserModel> {
        const url = `${this.apiUrl}/${id}`;
        const headers = this.getHeaders();
        return this.http.put<IUserModel>(url, user, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    deleteUser(id: number): Observable<void> {
        const url = `${this.apiUrl}/${id}`;
        const headers = this.getHeaders();
        return this.http.delete<void>(url, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    assignRole(userId: number, roleId: number): Observable<IUserModel> {
        const url = `${this.apiUrl}/${userId}/roles/${roleId}`;
        const headers = this.getHeaders();
        return this.http.post<IUserModel>(url, {}, { headers }).pipe(
            catchError(this.handleError)
        );
    }

    removeRole(userId: number, roleId: number): Observable<IUserModel> {
        const url = `${this.apiUrl}/${userId}/roles/${roleId}`;
        const headers = this.getHeaders();
        return this.http.delete<IUserModel>(url, { headers }).pipe(
            catchError(this.handleError)
        );
    }
}