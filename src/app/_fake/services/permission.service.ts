import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';

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

  constructor(private http: HttpClient) { }

  getPermissions(dataTablesParameters: any): Observable<DataTablesResponse> {
    const url = `${this.apiUrl}-list`;
    return this.http.post<DataTablesResponse>(url, dataTablesParameters);
  }

  getPermission(id: number): Observable<IPermissionModel> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<IPermissionModel>(url);
  }

  createPermission(user: IPermissionModel): Observable<IPermissionModel> {
    return this.http.post<IPermissionModel>(this.apiUrl, user);
  }

  updatePermission(id: number, user: IPermissionModel): Observable<IPermissionModel> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<IPermissionModel>(url, user);
  }

  deletePermission(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url);
  }
}
