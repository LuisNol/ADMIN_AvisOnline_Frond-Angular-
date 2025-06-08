import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, finalize, catchError, throwError } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from '../../auth';

@Injectable({
  providedIn: 'root'
})
export class AttributesService {

  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;
  
  constructor(
    private http: HttpClient,
    public authservice: AuthService,
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }
  
  private getHeaders(): HttpHeaders {
    const token = this.authservice.token || localStorage.getItem('token');
    if (!token) {
      console.warn('No hay token disponible para atributos');
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }
    
    return new HttpHeaders({
      'Authorization': 'Bearer ' + token,
      'X-User-Permission': 'manage-products',
      'Content-Type': 'application/json'
    });
  }
  
  private handleError = (error: any) => {
    console.error('Error en API de atributos:', error);
    if (error.status === 403) {
      console.error('Error de permisos para atributos');
    }
    return throwError(() => error);
  }
  
  listAttributes(page:number = 1,search:string){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/attributes?page="+page+"&search="+search; 
    return this.http.get(URL,{headers: headers}).pipe(
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  createAttributes(data:any){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/attributes"; 
    return this.http.post(URL,data,{headers: headers}).pipe(
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  updateAttributes(attribute_id:string,data:any){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/attributes/"+attribute_id; 
    return this.http.put(URL,data,{headers: headers}).pipe(
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteAttributes(attribute_id:string){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/attributes/"+attribute_id; 
    return this.http.delete(URL,{headers: headers}).pipe(
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }


  createProperties(data:any){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/properties"; 
    return this.http.post(URL,data,{headers: headers}).pipe(
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deletePropertie(propertie_id:string){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/properties/"+propertie_id; 
    return this.http.delete(URL,{headers: headers}).pipe(
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
}
