import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, finalize, catchError, throwError, tap } from 'rxjs';
import { URL_SERVICIOS } from 'src/app/config/config';
import { AuthService } from '../../auth';
import { PermissionService } from 'src/app/modules/auth/services/permission.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  isLoading$: Observable<boolean>;
  isLoadingSubject: BehaviorSubject<boolean>;
  
  constructor(
    private http: HttpClient,
    public authservice: AuthService,
    private permissionService: PermissionService
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.isLoading$ = this.isLoadingSubject.asObservable();
  }
  
  // Método para crear encabezados HTTP con el token y permisos
  private getHeaders(): HttpHeaders {
    // Determinar el permiso correcto a usar basado en los permisos actuales
    let permissionToUse = '';
    
    if (this.permissionService.hasPermission('manage-products')) {
      permissionToUse = 'manage-products';
      console.log('Usando permiso manage-products para encabezados');
    } else if (this.permissionService.hasPermission('manage-own-products')) {
      permissionToUse = 'manage-own-products';
      console.log('Usando permiso manage-own-products para encabezados');
    } else {
      console.warn('No se encontró ningún permiso válido para productos');
    }
    
    // Crear headers con el permiso adecuado
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.authservice.token,
      'X-User-Permission': permissionToUse
    });
    
    console.log('Headers generados:', {
      'Authorization': 'Bearer ' + this.authservice.token.substring(0, 10) + '...',
      'X-User-Permission': permissionToUse
    });
    
    return headers;
  }
  
  // Método común para manejar errores HTTP
  private handleError(error: HttpErrorResponse) {
    console.error('Error en API:', error);
    
    // Si es un error 403, podría ser un problema de permisos
    if (error.status === 403) {
      console.error('Error de permisos:', error);
    }
    
    return throwError(() => error);
  }
  
  listProducts(page:number = 1, data:any){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/products/index?page="+page; 
    
    return this.http.post(URL, data, {headers: headers}).pipe(
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  configAll(){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/products/config"; 
    
    return this.http.get(URL, {headers: headers}).pipe(
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  createProducts(data:any){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/products"; 
    
    console.log('Intentando crear producto con permiso:', headers.get('X-User-Permission'));
    
    return this.http.post(URL, data, {headers: headers}).pipe(
      tap(response => {
        console.log('Respuesta exitosa al crear producto:', response);
      }),
      catchError((error) => {
        console.error('Error en createProducts:', error);
        if (error.status === 403) {
          console.error('Error de permisos 403:', error.error || error.message);
        }
        return this.handleError(error);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  showProduct(product_id:string){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/products/"+product_id; 
    
    return this.http.get(URL, {headers: headers}).pipe(
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  updateProducts(product_id:string, data:any){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/products/"+product_id; 
    
    return this.http.post(URL, data, {headers: headers}).pipe(
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteProduct(product_id:string){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/products/"+product_id; 
    
    return this.http.delete(URL, {headers: headers}).pipe(
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  imagenAdd(data:any){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/products/imagens"; 
    
    return this.http.post(URL, data, {headers: headers}).pipe(
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteImageProduct(imagen_id:string){
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS+"/admin/products/imagens/"+imagen_id; 
    
    return this.http.delete(URL, {headers: headers}).pipe(
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
}
