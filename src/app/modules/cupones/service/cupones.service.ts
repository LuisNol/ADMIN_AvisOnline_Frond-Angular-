import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, finalize, catchError, throwError } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from '../../auth';

@Injectable({
  providedIn: 'root'
})
export class CuponesService {

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
      console.warn('No hay token disponible para cupones');
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
    console.error('Error en API de cupones:', error);
    if (error.status === 403) {
      console.error('Error de permisos para cupones');
    }
    return throwError(() => error);
  }
  
  listCupones(page:number = 1,search:string){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/cupones?page="+page+"&search="+search; 
    return this.http.get(URL,{headers: headers}).pipe(
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  configCupones(){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/cupones/config"; 
    return this.http.get(URL,{headers: headers}).pipe(
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  createCupones(data:any){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/cupones"; 
    return this.http.post(URL,data,{headers: headers}).pipe(
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  showCupone(cupone_id:string){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/cupones/"+cupone_id; 
    return this.http.get(URL,{headers: headers}).pipe(
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  updateCupones(cupone_id:string,data:any){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/cupones/"+cupone_id; 
    return this.http.put(URL,data,{headers: headers}).pipe(
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteCupone(cupone_id:string){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/cupones/"+cupone_id; 
    return this.http.delete(URL,{headers: headers}).pipe(
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

}
