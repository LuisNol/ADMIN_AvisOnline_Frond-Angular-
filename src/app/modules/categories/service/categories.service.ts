import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, finalize, catchError, throwError } from 'rxjs';
import { AuthService } from '../../auth';
import { URL_SERVICIOS } from 'src/app/config/config';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

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
    console.log('🔑 CATEGORIES SERVICE - Token obtenido:', token ? 'Presente' : 'AUSENTE');
    
    if (!token) {
      console.warn('❌ No hay token disponible para categorías');
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }
    
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token,
      'X-User-Permission': 'manage-products',
      'Content-Type': 'application/json'
    });
    
    console.log('📤 CATEGORIES SERVICE - Headers construidos:', {
      'Authorization': 'Bearer ' + token.substring(0, 20) + '...',
      'X-User-Permission': 'manage-products',
      'Content-Type': 'application/json'
    });
    
    return headers;
  }
  
  listCategories(page:number = 1,search:string){
    console.log('🌐 CATEGORIES SERVICE - Iniciando listCategories');
    console.log('📊 Parámetros:', { page, search });
    
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/categories?page="+page+"&search="+search; 
    
    console.log('🔗 URL construida:', URL);
    
    return this.http.get(URL,{headers: headers}).pipe(
      catchError((error) => {
        console.error('❌ Error al listar categorías:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Message:', error.message);
        return throwError(() => error);
      }),
      finalize(() => {
        console.log('✅ CATEGORIES SERVICE - Request finalizado');
        this.isLoadingSubject.next(false);
      })
    );
  }

  configCategories(){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/categories/config"; 
    return this.http.get(URL,{headers: headers}).pipe(
      catchError((error) => {
        console.error('Error al obtener configuración de categorías:', error);
        return throwError(() => error);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  createCategories(data:any){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/categories"; 
    return this.http.post(URL,data,{headers: headers}).pipe(
      catchError((error) => {
        console.error('Error al crear categoría:', error);
        return throwError(() => error);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  showCategorie(categorie_id:string){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/categories/"+categorie_id; 
    return this.http.get(URL,{headers: headers}).pipe(
      catchError((error) => {
        console.error('Error al obtener categoría:', error);
        return throwError(() => error);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  updateCategories(categorie_id:string,data:any){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/categories/"+categorie_id; 
    return this.http.post(URL,data,{headers: headers}).pipe(
      catchError((error) => {
        console.error('Error al actualizar categoría:', error);
        return throwError(() => error);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteCategorie(categorie_id:string){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/categories/"+categorie_id; 
    return this.http.delete(URL,{headers: headers}).pipe(
      catchError((error) => {
        console.error('Error al eliminar categoría:', error);
        return throwError(() => error);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

}
