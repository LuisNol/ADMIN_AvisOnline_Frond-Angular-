import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PermissionService } from 'src/app/modules/auth/services/permission.service';
import { ProductService } from './product.service';

@Injectable({ providedIn: 'root' })
export class ProductLimitService {
  private readonly MAX_PRODUCTS = 3;

  constructor(
    private permissionService: PermissionService,
    private productService: ProductService
  ) {}

  /**
   * Devuelve true si el usuario puede crear un producto.
   * - Administradores siempre pueden (rol 'Admin').
   * - Usuarios normales hasta MAX_PRODUCTS.
   */
  canCreateProduct(): Observable<boolean> {
    if (this.permissionService.hasRole('Admin')) {
      return of(true);
    }

    return this.productService.countMyProducts().pipe(
      map(resp => resp.count < this.MAX_PRODUCTS),
      catchError(() => of(true)) // en caso de error, permitir creación
    );
  }

  /**
   * Devuelve cuántos intentos le quedan al usuario para crear productos.
   * - Para administradores, devolvemos MAX_PRODUCTS para que la UI no muestre un número negativo.
   */
  getRemainingAttempts(): Observable<number> {
    if (this.permissionService.hasRole('Admin')) {
      return of(this.MAX_PRODUCTS);
    }

    return this.productService.countMyProducts().pipe(
      map(resp => Math.max(this.MAX_PRODUCTS - resp.count, 0)),
      catchError(() => of(this.MAX_PRODUCTS))
    );
  }
}
