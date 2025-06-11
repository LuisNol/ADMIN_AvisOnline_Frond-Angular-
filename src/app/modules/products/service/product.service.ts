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
  
  // Método para verificar si el servicio está listo
  private isServiceReady(): boolean {
    const token = localStorage.getItem('token') || this.authservice.token;
    const permissions = localStorage.getItem('user_permissions');
    return !!(token && permissions);
  }
  
  // Método para crear encabezados HTTP con el token y permisos
  private getHeaders(): HttpHeaders {
    // Obtener el token de manera segura
    const token = this.authservice.token || localStorage.getItem('token');
    
    if (!token) {
      console.warn('No hay token disponible');
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
    }
    
    // Verificar si el servicio está listo
    if (!this.isServiceReady()) {
      console.warn('Servicio no está completamente inicializado, usando valores por defecto');
      return new HttpHeaders({
        'Authorization': 'Bearer ' + token,
        'X-User-Permission': 'manage-own-products',
        'Content-Type': 'application/json'
      });
    }
    
    // Determinar el permiso correcto a usar basado en los permisos actuales
    let permissionToUse = '';
    
    if (this.permissionService.hasPermission('manage-products')) {
      permissionToUse = 'manage-products';
      console.log('Usando permiso manage-products para encabezados');
    } else if (this.permissionService.hasPermission('manage-own-products')) {
      permissionToUse = 'manage-own-products';
      console.log('Usando permiso manage-own-products para encabezados');
    } else {
      console.warn('No se encontró ningún permiso válido para productos, usando valor por defecto');
      permissionToUse = 'manage-own-products'; // Valor por defecto seguro
    }
    
    // Crear headers con el permiso adecuado
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + token,
      'X-User-Permission': permissionToUse,
      'Content-Type': 'application/json'
    });
    
    // Log seguro del token (solo primeros caracteres)
    const tokenPreview = token && token.length > 10 ? token.substring(0, 10) + '...' : 'token_corto';
    console.log('Headers generados:', {
      'Authorization': 'Bearer ' + tokenPreview,
      'X-User-Permission': permissionToUse
    });
    
    return headers;
  }
  
  // Método común para manejar errores HTTP
  private handleError = (error: HttpErrorResponse) => {
    console.error('Error en API:', error);
    
    // Si es un error 403, podría ser un problema de permisos
    if (error.status === 403) {
      console.error('Error de permisos 403:', error);
      console.error('Detalles del error:', error.error || error.message);
    } else if (error.status === 401) {
      console.error('Error de autenticación 401:', error);
      // Podrías redirigir al login aquí si es necesario
    }
    
    return throwError(() => error);
  }
  
  listProducts(page: number = 1, data: any) {
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS + "/admin/products/index?page=" + page; 
    
    return this.http.post(URL, data, { headers: headers }).pipe(
      tap(response => {
        console.log('Respuesta exitosa en listProducts:', response);
      }),
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  configAll() {
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS + "/admin/products/config"; 
    
    return this.http.get(URL, { headers: headers }).pipe(
      tap(response => {
        console.log('Respuesta exitosa en configAll:', response);
      }),
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  createProducts(data: any) {
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS + "/admin/products"; 
    
    console.log('Intentando crear producto con permiso:', headers.get('X-User-Permission'));
    
    return this.http.post(URL, data, { headers: headers }).pipe(
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

  showProduct(product_id: string) {
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS + "/admin/products/" + product_id; 
    
    return this.http.get(URL, { headers: headers }).pipe(
      tap(response => {
        console.log('Respuesta exitosa en showProduct:', response);
      }),
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  updateProducts(product_id: string, data: any) {
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS + "/admin/products/" + product_id; 
    
    return this.http.post(URL, data, { headers: headers }).pipe(
      tap(response => {
        console.log('Respuesta exitosa al actualizar producto:', response);
      }),
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteProduct(product_id: string) {
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS + "/admin/products/" + product_id; 
    
    return this.http.delete(URL, { headers: headers }).pipe(
      tap(response => {
        console.log('Respuesta exitosa al eliminar producto:', response);
      }),
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  imagenAdd(data: any) {
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS + "/admin/products/imagens"; 
    
    return this.http.post(URL, data, { headers: headers }).pipe(
      tap(response => {
        console.log('Respuesta exitosa al agregar imagen:', response);
      }),
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  deleteImageProduct(imagen_id: string) {
    this.isLoadingSubject.next(true);
    let headers = this.getHeaders();
    let URL = URL_SERVICIOS + "/admin/products/imagens/" + imagen_id; 
    
    return this.http.delete(URL, { headers: headers }).pipe(
      tap(response => {
        console.log('Respuesta exitosa al eliminar imagen:', response);
      }),
      catchError(this.handleError),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
}