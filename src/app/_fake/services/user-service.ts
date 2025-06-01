import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IRoleModel } from './role.service';
import { URL_SERVICIOS } from 'src/app/config/config';

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

    constructor(private http: HttpClient) { }

    getUsers(dataTablesParameters: any): Observable<DataTablesResponse> {
        const url = `${this.apiUrl}-list`;
        return this.http.post<DataTablesResponse>(url, dataTablesParameters);
    }

    getUser(id: number): Observable<IUserModel> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.get<IUserModel>(url);
    }

    createUser(user: IUserModel): Observable<IUserModel> {
        return this.http.post<IUserModel>(this.apiUrl, user);
    }

    updateUser(id: number, user: IUserModel): Observable<IUserModel> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.put<IUserModel>(url, user);
    }

    deleteUser(id: number): Observable<void> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete<void>(url);
    }

    assignRole(userId: number, roleId: number): Observable<IUserModel> {
        const url = `${this.apiUrl}/${userId}/roles/${roleId}`;
        return this.http.post<IUserModel>(url, {});
    }

    removeRole(userId: number, roleId: number): Observable<IUserModel> {
        const url = `${this.apiUrl}/${userId}/roles/${roleId}`;
        return this.http.delete<IUserModel>(url);
    }
}